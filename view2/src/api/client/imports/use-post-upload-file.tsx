import { AxiosResponse } from 'axios';
import useAxios, { ResponseValues } from 'axios-hooks';

export const usePostUploadFile = () => {
    const [, sendFile] = useAxios(
        {
            url: 'import/upload/',
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
        { manual: true },
    );
    return {
        sendFile: (kind: string, file: File): Promise<AxiosResponse> => {
            const form = new FormData();
            form.append('kind', kind);
            form.append('file', file, file.name);
            return sendFile({
                data: form,
            });
        },
    };
};
