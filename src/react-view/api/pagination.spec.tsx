/** eslint-disable @typescript-eslint/require-await */
import { fireEvent, render, screen } from '@testing-library/react';
import React, { act } from 'react';

import { PaginationLoadOptions, RequestedPage, usePagination } from './pagination';

interface DemoPaginationProps {
    cb: (cursor?: string) => Promise<RequestedPage<number>>;
    options?: PaginationLoadOptions<number>;
}

const DemoPagination: React.FC<DemoPaginationProps> = ({ cb, options }) => {
    const pagination = usePagination(cb, options);
    return (
        <div>
            <button
                onClick={() => {
                    pagination.start();
                }}
                data-testid="start-button"
            >
                start
            </button>
            <button
                onClick={() => {
                    pagination.reset(true);
                }}
                data-testid="reset-button"
            >
                start
            </button>
            <ul>
                <li data-testid="status">{pagination.status}</li>
                <li>
                    <ul data-testid="data">
                        {pagination.loadedData.map(data => (
                            <li key={data}>{data}</li>
                        ))}
                    </ul>
                </li>
            </ul>
        </div>
    );
};

describe('usePagination', () => {
    it('Test the reset', async () => {
        const cb = jest.fn();
        cb.mockResolvedValueOnce({ results: [1, 2], next: '12' });
        cb.mockResolvedValueOnce({ results: [3] });
        cb.mockResolvedValueOnce({ results: [5, 6] });
        await act(async () => {
            render(<DemoPagination cb={cb} />);
            await Promise.resolve({});
        });
        expect(screen.getByTestId('status').textContent).toBe('completed');

        expect(screen.getByTestId('data').children.length).toBe(3);

        await act(async () => {
            fireEvent.click(screen.getByTestId('reset-button'));
            await Promise.resolve({});
        });

        expect(screen.getByTestId('data').children.length).toBe(2);
        expect(screen.getByTestId('status').textContent).toBe('completed');
        expect(screen.getByTestId('data').textContent).toEqual('56');
    });

    it('Basic query with multiple pages', async () => {
        const cb = jest.fn();
        cb.mockResolvedValueOnce({ results: [1, 2], next: '12' });
        cb.mockResolvedValueOnce({ results: [3] });
        await act(async () => {
            render(<DemoPagination cb={cb} />);
            await Promise.resolve({});
        });
        expect(screen.getByTestId('status').textContent).toBe('completed');
        expect(screen.getByTestId('data').children.length).toBe(3);
        expect(cb).toHaveBeenCalledTimes(2);
        expect(cb).toHaveBeenCalledWith('12');
        expect(cb).toHaveBeenCalledWith(undefined);
    });

    it('Basic query with multiple pages and repeated', async () => {
        const cb = jest.fn();
        cb.mockResolvedValueOnce({ results: [1, 2], next: '12' });
        cb.mockResolvedValueOnce({ results: [3] });
        await act(async () => {
            render(<DemoPagination cb={cb} options={{ autostart: true, hash: elem => String(elem % 2) }} />);
            await Promise.resolve({});
        });
        expect(screen.getByTestId('status').textContent).toBe('completed');
        expect(screen.getByTestId('data').children.length).toBe(2);
        expect(screen.getByTestId('data').textContent).toEqual('32');
    });
});
