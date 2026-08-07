UPDATE public.cake_builder_assets
SET svg_content = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160"><g><path d="M20 40 C20 14, 62 8, 100 34 C138 8, 180 14, 180 40 L180 108 C180 130, 150 142, 100 142 C50 142, 20 130, 20 108 Z" fill="var(--cake-icing)"/><path d="M20 66 C60 82, 140 82, 180 66 L180 78 C140 94, 60 94, 20 78 Z" fill="var(--cake-sponge)" opacity="0.55"/><path d="M20 92 C60 108, 140 108, 180 92 L180 100 C140 116, 60 116, 20 100 Z" fill="var(--cake-filling)" opacity="0.75"/><ellipse cx="100" cy="140" rx="80" ry="10" fill="var(--cake-shade)" opacity="0.12"/></g></svg>',
    notes = 'Side elevation — heart-fronted cake with visible height and layers.',
    updated_at = now()
WHERE key = 'shape-heart';

UPDATE public.cake_builder_assets
SET svg_content = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160"><g><rect x="26" y="20" width="148" height="118" rx="14" fill="var(--cake-icing)"/><rect x="26" y="58" width="148" height="14" fill="var(--cake-sponge)" opacity="0.5"/><rect x="26" y="92" width="148" height="12" fill="var(--cake-filling)" opacity="0.7"/><rect x="26" y="20" width="148" height="118" rx="14" fill="none" stroke="var(--cake-shade)" stroke-opacity="0.12"/><ellipse cx="100" cy="140" rx="78" ry="9" fill="var(--cake-shade)" opacity="0.12"/></g></svg>',
    notes = 'Side elevation — sculpted number cake body; the numeral is drawn over it.',
    updated_at = now()
WHERE key = 'shape-number';