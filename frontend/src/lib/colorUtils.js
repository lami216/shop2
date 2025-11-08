const clamp = (value) => Math.max(0, Math.min(255, value));

const hexToRgb = (hex) => {
        if (!hex) return null;
        const normalized = hex.replace("#", "");
        if (![3, 6].includes(normalized.length)) return null;
        const chunkSize = normalized.length === 3 ? 1 : 2;
        const chunks = normalized.match(new RegExp(`.{${chunkSize}}`, "g"));
        if (!chunks) return null;
        const values = chunks.map((chunk) => parseInt(chunk.length === 1 ? chunk.repeat(2) : chunk, 16));
        if (values.some((number) => Number.isNaN(number))) return null;
        return { r: values[0], g: values[1], b: values[2] };
};

const parseColor = (color) => {
        if (!color) return null;
        if (color.startsWith("#")) {
                return hexToRgb(color);
        }
        const rgbMatch = color.match(/rgba?\(([^)]+)\)/i);
        if (!rgbMatch) return null;
        const [r, g, b] = rgbMatch[1]
                .split(",")
                .slice(0, 3)
                .map((component) => clamp(parseFloat(component)));
        if ([r, g, b].some((number) => Number.isNaN(number))) return null;
        return { r, g, b };
};

export const getReadableTextColor = (backgroundColor) => {
        const rgb = parseColor(backgroundColor);
        if (!rgb) return "#1E1E1E";
        const { r, g, b } = rgb;
        const [red, green, blue] = [r, g, b].map((value) => {
                const ratio = value / 255;
                return ratio <= 0.03928 ? ratio / 12.92 : Math.pow((ratio + 0.055) / 1.055, 2.4);
        });
        const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
        return luminance > 0.55 ? "#1E1E1E" : "#FFFFFF";
};
