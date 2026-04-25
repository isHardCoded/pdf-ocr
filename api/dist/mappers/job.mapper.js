function iso(d) {
    if (d == null)
        return d === null ? null : undefined;
    return d.toISOString();
}
export function toJobOut(row) {
    return {
        id: row.id,
        filename: row.filename,
        status: row.status,
        progress: row.progress,
        total_pages: row.totalPages,
        current_page: row.currentPage,
        language: row.language,
        optimize: row.optimize,
        deskew: row.deskew,
        mode: row.mode,
        input_size: row.inputSize,
        output_size: row.outputSize,
        error: row.error,
        created_at: iso(row.createdAt),
        started_at: iso(row.startedAt) ?? null,
        completed_at: iso(row.completedAt) ?? null,
    };
}
