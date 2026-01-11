import { act, render, screen } from '@testing-library/react';
import { setupServer, SetupServerApi } from 'msw/node';
import React from 'react';
import { BrowserRouter } from 'react-router';

import App from './app';
import AllProviders from './utils/providers';
import { http } from './utils/test/set-up-server';

const Subject = ()=> 
    // Fix: All Providers should apply the browserRoute, but it doesn't seem to work for some reason
    <BrowserRouter>
        <AllProviders server="http://localhost">
            <App />
        </AllProviders>
    </BrowserRouter>

describe(`[${App.name}]`, () => {
    let server: SetupServerApi;
    beforeEach(() => {
        server = setupServer();
        server.listen();
    });

    afterEach(() => {
        server.close();
    });

    describe('Non authenticated', () => {
        it('accessing without being identified shows the login', async () => {
            server.use(
                http.get('/session', ({ response }) => {
                    return response(200).json({
                        user: 'anonymous',
                    });
                }),
            );

            await act(async () => {
                render(
                    <Subject />,
                );
                await Promise.resolve({});
            });

            expect(screen.getByTestId('login-form')).toBeTruthy();
        });
    });

    describe('Authenticated', () => {
        beforeEach(() => {
            server.use(
                http.get('/session', ({ response }) => {
                    return response(200).json({
                        user: 'identified',
                        profile: {
                            email: 'test@test.com',
                            id: '1',
                            isAdmin: true,
                            isActive: true,
                            groups: [],
                            defaultGroupId: 'group-1',
                            username: 'test',
                        },
                    });
                }),
            );
            server.use(
                http.get('/bank-transactions', ({ response }) => {
                    return response(200).json({
                        results: [],
                    });
                }),
            );
            server.use(
                http.get('/labels', ({ response }) => {
                    return response(200).json({
                        results: [],
                    });
                }),
            );
            server.use(
                http.get('/graphs', ({ response }) => {
                    return response(200).json({
                        results: [],
                    });
                }),
            );
        });

        it(' does show the graphs view ', async () => {
            await act(async () => {
                render(
                    <Subject/>,
                );
                await Promise.resolve({});
            });

            expect(screen.getByTestId('add-graph-placeholder')).toBeTruthy();
        });
    });
});
