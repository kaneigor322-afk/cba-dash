export const patchRow = (rowId: number, fields: Record<string, unknown>): Promise<Response> =>
    fetch(`/api/rows/${rowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
    });

export const saveSetting = (key: string, value: string): Promise<Response> =>
    fetch(`/api/settings/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
    });
