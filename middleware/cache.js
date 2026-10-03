const cacheStore = {};
const CACHE_DURATION = 60 * 1000;

const cacheWare = (req, res, next) => {
    if (req.method !== 'GET') {
        return next();
    }

    const cacheKey = req.originalUrl;
    const entry = cacheStore[cacheKey];

    if (entry) {
        const elapsed = Date.now() - entry.timestamp;

        if (elapsed < CACHE_DURATION) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(entry.data);
        }

        delete cacheStore[cacheKey];
    }

    res.setHeader('X-Cache', 'MISS');

    const sendJson = res.json.bind(res);

    res.json = (data) => {
        const success = res.statusCode >= 200 && res.statusCode < 300;

        if (success) {
            cacheStore[cacheKey] = {
                data,
                timestamp: Date.now()
            };
        }

        return sendJson(data);
    };

    next();
};

const invalidateCache = (req, res, next) => {
    res.once('finish', () => {
        const methodsToInvalidate = ['POST', 'PUT', 'PATCH', 'DELETE'];
        const shouldInvalidate = methodsToInvalidate.includes(req.method);
        const requestSucceeded = res.statusCode >= 200 && res.statusCode < 300;

        if (shouldInvalidate && requestSucceeded) {
            for (const key of Object.keys(cacheStore)) {
                delete cacheStore[key];
            }

            console.log(
                `Cache cleared after successful ${req.method} request.`
            );
        }
    });

    next();
};

module.exports = {
    cacheWare,
    invalidateCache
};
