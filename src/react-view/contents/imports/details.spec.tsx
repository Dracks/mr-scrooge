import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { setupServer, SetupServerApi } from 'msw/node';
import React from 'react';

import { ProvideApi } from '../../api/client';
import { FileImport } from '../../api/models';
import { http } from '../../utils/test/set-up-server';
import { ImportDetails } from './details';

const baseImport: FileImport = {
    id: 'import-1',
    createdAt: new Date('2025-01-15').toISOString(),
    description: 'Test description',
    fileName: 'test.csv',
    groupOwnerId: 'group-1',
    kind: 'csv',
    status: 'ok',
    rows: [
        {
            movementName: 'Payment',
            date: '2025-01-01',
            value: 100.5,
            message: 'OK',
        },
    ],
};

describe('ImportDetails', () => {
    let server: SetupServerApi;

    beforeEach(() => {
        server = setupServer();
        server.listen();
        window.scrollTo = jest.fn();
    });

    afterEach(() => {
        server.close();
    });

    it('renders file name and creation date', () => {
        render(<ImportDetails status={baseImport} onDeleted={jest.fn()} />);
        expect(screen.getByText('test.csv')).toBeTruthy();
        expect(screen.getByText(baseImport.createdAt)).toBeTruthy();
    });

    it('renders table with import rows', () => {
        render(<ImportDetails status={baseImport} onDeleted={jest.fn()} />);
        expect(screen.getByText('Payment')).toBeTruthy();
        expect(screen.getByText('OK')).toBeTruthy();
    });

    it('calls onDeleted with the import id on successful deletion', async () => {
        server.use(
            http.delete('/imports/{id}', ({ response }) => {
                return response.untyped(new Response('true'));
            }),
        );

        const onDeleted = jest.fn();
        render(
            <ProvideApi server="http://localhost">
                <ImportDetails status={baseImport} onDeleted={onDeleted} />
            </ProvideApi>,
        );

        fireEvent.click(screen.getByTestId('confirmation-button'));
        await Promise.resolve();

        await act(async () => {
            fireEvent.click(screen.getByTestId('confirmation-button-yes'));
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(onDeleted).toHaveBeenCalledWith('import-1');
        });
    });

    it('shows error message and does not call onDeleted when DELETE fails', async () => {
        server.use(
            http.delete('/imports/{id}', ({ response }) => {
                return response.untyped(
                    new Response(JSON.stringify({ code: 'SERVER_ERR', message: 'Server error' }), { status: 500 }),
                );
            }),
        );

        const onDeleted = jest.fn();
        render(
            <ProvideApi server="http://localhost">
                <ImportDetails status={baseImport} onDeleted={onDeleted} />
            </ProvideApi>,
        );

        fireEvent.click(screen.getByTestId('confirmation-button'));
        await Promise.resolve();

        await act(async () => {
            fireEvent.click(screen.getByTestId('confirmation-button-yes'));
            await Promise.resolve();
        });

        await waitFor(() => {
            expect(screen.getByText(/SERVER_ERR/)).toBeTruthy();
            expect(screen.getByText(/Server error/)).toBeTruthy();
        });

        expect(onDeleted).not.toHaveBeenCalled();
    });

    it('shows error notification for error status', () => {
        const errorImport: FileImport = {
            ...baseImport,
            status: 'error',
            description: 'Something went wrong',
        };
        render(<ImportDetails status={errorImport} onDeleted={jest.fn()} />);
        expect(screen.getByText('Error')).toBeTruthy();
        expect(screen.getByText('Something went wrong')).toBeTruthy();
    });

    it('shows warning notification for warning status', () => {
        const warningImport: FileImport = {
            ...baseImport,
            status: 'warning',
            description: 'Warning message',
        };
        render(<ImportDetails status={warningImport} onDeleted={jest.fn()} />);
        expect(screen.getByText('Warning')).toBeTruthy();
        expect(screen.getByText('Warning message')).toBeTruthy();
    });
});
