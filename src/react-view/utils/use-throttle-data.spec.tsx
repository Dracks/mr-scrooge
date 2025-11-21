import { act, renderHook } from '@testing-library/react';

import { useThrottledData } from './use-throttle-data';

describe('useThrottledData', () => {
    vi.useFakeTimers();

    it('Should only process the first element until delay happened', () => {
        const { result, rerender } = renderHook(({ data }) => useThrottledData(data, 1000), {
            initialProps: { data: [1, 2, 3] },
        });

        expect(result.current).toEqual([1, 2, 3]);
        rerender({ data: [2, 3] });

        expect(result.current).toEqual([1, 2, 3]);
    });

    it('Should update to the last update when the time expires', () => {
        const { result, rerender } = renderHook(({ data }) => useThrottledData(data, 500), {
            initialProps: { data: [1, 2, 3] },
        });

        rerender({ data: [2, 3] });
        act(() => {
            vi.advanceTimersByTime(255);
        });
        expect(result.current).toEqual([1, 2, 3]);
        rerender({ data: [5, 6] });

        // Fast forward past delay
        act(() => {
            vi.advanceTimersByTime(255);
        });

        expect(result.current).toEqual([5, 6]);
    });

    it('Should clear the timer when the component is removed to avoid errors', () => {
        const { unmount } = renderHook(() => useThrottledData([1, 2], 500));
        unmount();

        act(() => {
            vi.advanceTimersByTime(1000);
        });
    });
});
