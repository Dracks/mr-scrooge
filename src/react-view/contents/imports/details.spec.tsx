import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { FileImport } from '../../api/models';
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
    it('renders file name and creation date', () => {
        render(<ImportDetails status={baseImport} onDelete={jest.fn()} />);
        expect(screen.getByText('test.csv')).toBeTruthy();
    });

    it('renders table with import rows', () => {
        render(<ImportDetails status={baseImport} onDelete={jest.fn()} />);
        expect(screen.getByText('Payment')).toBeTruthy();
        expect(screen.getByText('OK')).toBeTruthy();
    });

    it('calls onDelete with the import id on confirmation', async () => {
        const onDelete = jest.fn();
        render(<ImportDetails status={baseImport} onDelete={onDelete} />);

        fireEvent.click(screen.getByTestId('confirmation-button'));
        await Promise.resolve();

        await act(async () => {
            fireEvent.click(screen.getByTestId('confirmation-button-yes'));
            await Promise.resolve();
        });

        expect(onDelete).toHaveBeenCalledWith('import-1');
    });

    it('shows error notification for error status', () => {
        const errorImport: FileImport = {
            ...baseImport,
            status: 'error',
            description: 'Something went wrong',
        };
        render(<ImportDetails status={errorImport} onDelete={jest.fn()} />);
        expect(screen.getByText('Error')).toBeTruthy();
        expect(screen.getByText('Something went wrong')).toBeTruthy();
    });

    it('shows warning notification for warning status', () => {
        const warningImport: FileImport = {
            ...baseImport,
            status: 'warning',
            description: 'Warning message',
        };
        render(<ImportDetails status={warningImport} onDelete={jest.fn()} />);
        expect(screen.getByText('Warning')).toBeTruthy();
        expect(screen.getByText('Warning message')).toBeTruthy();
    });
});
