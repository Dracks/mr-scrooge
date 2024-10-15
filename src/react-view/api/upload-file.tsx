import { useAsyncCallback } from 'react-async-hook';

export const usePostUploadFile = () => {
    const uploadRequest = useAsyncCallback((kind: string, file: File)=>{
        const form = new FormData();
        form.append('kind', kind);
        form.append('file', file, file.name)

        return fetch(
            '/api/imports/',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: form
            });
    });
    return uploadRequest
}
