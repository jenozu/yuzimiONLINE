# Print asset guide

## Naming convention

Store production artwork outside the public storefront/R2 preview bucket. Use:

`{product-slug}/{product-slug}__{width}x{height}in__{dpi}dpi__{color-profile}__v{revision}.{extension}`

Example: `cherry-signal/cherry-signal__24x36in__300dpi__srgb__v03.tif`

Use lowercase ASCII slugs, whole-inch dimensions, an explicit DPI/profile, and a two-digit revision. Never overwrite an approved file; increment the revision. Keep a checksum manifest beside the assets.

## Required pixel dimensions at 300 DPI

| Print size | Minimum pixels |
|---|---:|
| 8 × 10 in | 2400 × 3000 |
| 11 × 14 in | 3300 × 4200 |
| 12 × 18 in | 3600 × 5400 |
| 16 × 20 in | 4800 × 6000 |
| 18 × 24 in | 5400 × 7200 |
| 20 × 30 in | 6000 × 9000 |
| 24 × 32 in | 7200 × 9600 |
| 24 × 36 in | 7200 × 10800 |

The fulfillment provider’s bleed and safe-area template overrides these baseline dimensions. Do not upscale a smaller image merely to satisfy the pixel count.

## Approval record

For every product/size, record source filename, SHA-256 checksum, pixel dimensions, profile, bleed template version, proof date, and approver. The storefront image is only a preview and must never be sent to the printer as the production master.
