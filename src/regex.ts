enum Kind {
    dayOfWeek, dayOfMonth, month, none
}
const toRange = (unit: String, kind: Kind = Kind.none): String =>
    kind === Kind.dayOfWeek
        ? `((${unit})|\\*)(((\\/|#)\\d+)|(-(${unit})))*`
        : `((${unit})|\\*)((\\/\\d+)|(-(${unit})))*`;

const mapBaseRegex = (unit: String, kind: Kind = Kind.none): String => {
    if (kind === Kind.dayOfMonth) { unit = `(${unit})|((${unit})L)|(L(${unit}))|L`; }

    let result = toRange(unit, kind);

    if (kind === Kind.dayOfWeek) { result += "L?"; }

    result = `\\?|\\*|(${result}(,${result})*)`;

    if (kind === Kind.dayOfMonth) { result += `|((${unit})W)|(W(${unit}))|W|WL|LW`; }

    return `(${result})`;
};
export const longFormatCron =
    "(?<!(\\d|\\w))" +
    `(${mapBaseRegex("[0-5]?\\d")}\\s+)?` +
    [
        mapBaseRegex("[0-5]?\\d"),
        mapBaseRegex("[01]?\\d|2[0-3]"),
        mapBaseRegex("0?[1-9]|[12]\\d|3[01]", Kind.dayOfMonth),
        mapBaseRegex("[1-9]|1[012]|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC", Kind.month),
        mapBaseRegex("[0-7]|MON|TUE|WED|THU|FRI|SAT|SUN|L", Kind.dayOfWeek),
    ].join("\\s+") +
    `(\\s+${mapBaseRegex("\\d{4}")})?` +
    "(?!(\\d|\\w))";

export default longFormatCron;
