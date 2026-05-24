import { act, fireEvent, render, screen } from '@testing-library/react';
import { setupServer, SetupServerApi } from 'msw/node';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { ProvideApi } from '../../../api/client';
import { ProvideLogger } from '../../../utils/logger/logger.context';
import { http } from '../../../utils/test/set-up-server';
import { NewOAuthApp } from './new-oauth-app';

describe(`[${NewOAuthApp.name}]`, () => {
    let server: SetupServerApi;
    let reload: jest.Mock;

    beforeEach(() => {
        server = setupServer();
        server.listen();
        reload = jest.fn();
        window.scrollTo = jest.fn();
    });

    afterEach(() => {
        server.close();
    });

    const renderApp = () => {
        return render(
            <MemoryRouter>
                <ProvideLogger>
                    <ProvideApi server="http://localhost">
                        <NewOAuthApp reload={reload} />
                    </ProvideApi>
                </ProvideLogger>
            </MemoryRouter>,
        );
    };

    it('shows field validation errors on empty submit', async () => {
        renderApp();

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Create' }));
            await Promise.resolve();
        });

        expect(screen.getByText('Name is required')).toBeTruthy();
    });

    it('shows URL validation error for invalid URIs', async () => {
        renderApp();

        const inputs = screen.getAllByRole('textbox');
        fireEvent.change(inputs[0] as HTMLElement, { target: { value: 'Test App' } });
        fireEvent.change(inputs[2] as HTMLElement, { target: { value: 'not-a-url' } });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Create' }));
            await Promise.resolve();
        });

        expect(screen.getByText('Invalid URL')).toBeTruthy();
    });

    it('creates the app via API and shows the popup with returned data', async () => {
        const createRequest = jest.fn();
        server.use(
            http.post('/oauth/clients', async ({ request, response }) => {
                const body = await request.json();
                createRequest(body);
                return response(201).json({
                    client_id: 'new-client-1',
                    secret: 'super-secret-1',
                    name: 'Test App',
                    description: undefined,
                    redirect_uris: ['https://example.com/callback'],
                    scopes: ['userInfo'],
                    created_at: '2025-01-01T00:00:00Z',
                    updated_at: '2025-01-01T00:00:00Z',
                });
            }),
        );

        renderApp();

        const inputs = screen.getAllByRole('textbox');
        fireEvent.change(inputs[0] as HTMLElement, { target: { value: 'Test App' } });
        fireEvent.change(inputs[2] as HTMLElement, { target: { value: 'https://example.com/callback' } });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Create' }));
            await Promise.resolve();
        });

        expect(createRequest).toHaveBeenCalledTimes(1);
        expect(createRequest).toHaveBeenCalledWith({
            name: 'Test App',
            description: undefined,
            redirect_uris: ['https://example.com/callback'],
            scopes: [],
        });

        expect(screen.getByText('Application Created')).toBeTruthy();
        expect(screen.getByDisplayValue('new-client-1')).toBeTruthy();
        expect(screen.getByDisplayValue('super-secret-1')).toBeTruthy();
    });
});
