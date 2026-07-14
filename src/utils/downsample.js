/**
 * Agrupa lecturas en buckets de N minutos y devuelve la primera lectura de cada bucket.
 * Si intervaloMin <= 1, devuelve el array original sin copia.
 */
export function downsample(lecturas, intervaloMin) {
    if (!lecturas || lecturas.length === 0) return [];
    if (intervaloMin <= 1) return lecturas;
    const bucketSec = intervaloMin * 60;
    const map = new Map();
    for (const l of lecturas) {
        const epoch = Math.floor(new Date(l.fechaLectura).getTime() / 1000);
        const bucket = Math.floor(epoch / bucketSec);
        if (!map.has(bucket)) map.set(bucket, l);
    }
    return [...map.values()];
}
