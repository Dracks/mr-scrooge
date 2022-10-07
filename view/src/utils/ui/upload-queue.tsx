import { FileInput, Form, FormField } from 'grommet';
import React from 'react';

export const FileUploadQueue: React.FC<{
    label: string;
    onAdd: (fileList: File[]) => void;
}> = ({ label, onAdd }) => {
    return (
        <Form value={{ files: [] }} onChange={(nextValue: { files: File[] }) => onAdd(nextValue.files)}>
            <FormField name="files" htmlFor="upload-files-id" label={label}>
                <FileInput id="upload-files-id" name="files" multiple={true} />
            </FormField>
        </Form>
    );
};
