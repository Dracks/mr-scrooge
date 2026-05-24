/* eslint-disable @typescript-eslint/require-await */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { subDays, subMonths } from 'date-fns';
import { setupServer, SetupServerApi } from 'msw/node';
import React from 'react';

import { ProvideApi } from '../../api/client';
import { FileImport } from '../../api/models';
import { http } from '../../utils/test/set-up-server';
import { ImportBulkDropPopup } from './imports-drop-popup';

const createImport = (overrides: Partial<FileImport> = {}): FileImport => ({
    id: `import-${String(Math.random()).slice(2)}`,
    createdAt: new Date().toISOString(),
    description: '',
    fileName: 'file.csv',
    groupOwnerId: 'group-1',
    kind: 'csv',
    status: 'ok',
    rows: [],
    ...overrides,
});

describe('ImportBulkDropPopup', () => {
    let server: SetupServerApi;

    beforeEach(() => {
        server = setupServer();
        server.listen();
        window.scrollTo = jest.fn();
    });

    afterEach(() => {
        server.close();
    });

    const renderPopup = (imports: FileImport[], onClose = jest.fn(), onDone = jest.fn()) => {
        return render(
            <ProvideApi server="http://localhost">
                <ImportBulkDropPopup imports={imports} onClose={onClose} onDone={onDone} />
            </ProvideApi>,
        );
    };

    it('shows only imports older than 1 month', () => {
        const oldImport = createImport({
            id: 'old-1',
            fileName: 'old-import.csv',
            createdAt: subMonths(new Date(), 2).toISOString(),
        });
        const recentImport = createImport({
            id: 'recent-1',
            fileName: 'recent-import.csv',
            createdAt: subDays(new Date(), 1).toISOString(),
        });

        renderPopup([oldImport, recentImport]);

        expect(screen.getByText(/old-import\.csv/)).toBeTruthy();
        expect(screen.queryByText(/recent-import\.csv/)).toBeNull();
    });

    it('shows a message when no imports are older than 1 month', () => {
        const recentImport = createImport({
            id: 'recent-1',
            createdAt: subDays(new Date(), 1).toISOString(),
        });

        renderPopup([recentImport]);

        expect(screen.getByText('No imports older than 1 month.')).toBeTruthy();
    });

    it('changing the threshold re-filters the import list', () => {
        const import5DaysOld = createImport({
            id: 'imp-5d',
            fileName: 'five-days.csv',
            createdAt: subDays(new Date(), 5).toISOString(),
        });

        renderPopup([import5DaysOld]);

        expect(screen.queryByText(/five-days\.csv/)).toBeNull();

        const selectButton = screen.getByRole('button', { name: /1 month/ });
        fireEvent.click(selectButton);
        const option5Days = screen.getByRole('option', { name: '5 days' });
        fireEvent.click(option5Days);

        expect(screen.getByText(/five-days\.csv/)).toBeTruthy();
    });

    it('select all checkbox toggles all items', () => {
        const oldImport = createImport({
            id: 'old-1',
            createdAt: subMonths(new Date(), 2).toISOString(),
        });

        renderPopup([oldImport]);

        const selectAll = screen.getByRole('checkbox', {
            name: /Select All/,
        }) as unknown as HTMLInputElement;

        expect(selectAll.checked).toBe(false);
        fireEvent.click(selectAll);
        expect(selectAll.checked).toBe(true);
        fireEvent.click(selectAll);
        expect(selectAll.checked).toBe(false);
    });

    it('delete button is disabled when nothing is selected', () => {
        const oldImport = createImport({
            id: 'old-1',
            createdAt: subMonths(new Date(), 2).toISOString(),
        });

        renderPopup([oldImport]);

        expect((screen.getByRole('button', { name: /Delete Selected/ }) as unknown as HTMLButtonElement).disabled).toBe(
            true,
        );
    });

    it('calls DELETE for each selected import and calls onDone', async () => {
        const onDone = jest.fn();
        const deleteHandler = jest.fn();

        server.use(
            http.delete('/imports/{id}', ({ params, response }) => {
                deleteHandler(params.id);
                return response.untyped(new Response('true'));
            }),
        );

        const oldImport = createImport({
            id: 'old-1',
            fileName: 'old-import.csv',
            createdAt: subMonths(new Date(), 2).toISOString(),
        });

        renderPopup([oldImport], jest.fn(), onDone);

        fireEvent.click(screen.getByRole('checkbox', { name: /Select All/ }));

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /Delete Selected/ }));
        });

        await waitFor(() => {
            expect(deleteHandler).toHaveBeenCalledWith('old-1');
        });
        await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
        });
    });

    it('shows progress bar while deleting', async () => {
        server.use(
            http.delete('/imports/{id}', ({ response }) => {
                return response.untyped(new Response('true'));
            }),
        );

        const imports = [
            createImport({
                id: 'imp-1',
                createdAt: subMonths(new Date(), 2).toISOString(),
            }),
            createImport({
                id: 'imp-2',
                createdAt: subMonths(new Date(), 2).toISOString(),
            }),
        ];

        renderPopup(imports);

        fireEvent.click(screen.getByRole('checkbox', { name: /Select All/ }));

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /Delete Selected/ }));
        });

        await waitFor(() => {
            expect(screen.getByText(/deleting imports/i)).toBeTruthy();
        });

        await waitFor(() => {
            expect(screen.getByText(/2 of 2 deleted/)).toBeTruthy();
        });
    });
});
