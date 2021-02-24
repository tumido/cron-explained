enum Kind {
    dayOfWeek, dayOfMonth, none
}
const toRange = (unit: String, kind: Kind = Kind.none): String =>
    kind === Kind.dayOfWeek
        ? `((${unit})|\\*)(((\\/|#)\\d+)|(-(${unit})))*`
        : `((${unit})|\\*)((\\/\\d+)|(-(${unit})))*`;

const baseUnitToRegex = (unit: String, kind: Kind = Kind.none): String => {
    if (kind === Kind.dayOfMonth) { unit = `(${unit})|((${unit})L)|(L(${unit}))|L`; }

    let result = toRange(unit, kind);

    if (kind === Kind.dayOfWeek) { result += "L?"; }

    result = `\\?|\\*|(${result}(,${result})*)`;

    if (kind === Kind.dayOfMonth) { result += `|((${unit})W)|(W(${unit}))|W|WL|LW`; }

    return `(${result})`;
};

const sections = {
    seconds: baseUnitToRegex("[0-5]?\\d"),
    minutes: baseUnitToRegex("[0-5]?\\d"),
    hours: baseUnitToRegex("[01]?\\d|2[0-3]"),
    dayOfMonth: baseUnitToRegex("0?[1-9]|[12]\\d|3[01]", Kind.dayOfMonth),
    month: baseUnitToRegex("[1-9]|1[012]|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC"),
    dayOfWeek: baseUnitToRegex("[0-7]|MON|TUE|WED|THU|FRI|SAT|SUN|L", Kind.dayOfWeek),
    year: baseUnitToRegex("\\d{4}")
};

const standard = [sections.minutes, sections.hours, sections.dayOfMonth, sections.month, sections.dayOfWeek].join("\\s+");
const quartz = [sections.seconds, sections.minutes, sections.hours, sections.dayOfMonth, sections.month, sections.dayOfWeek].join("\\s+") + `(\\s+${sections.year})?`;

const cron = `((?<!(\\d|\\w))(((${quartz})|(${standard})))(?!(\\d|\\w)))`;
export default cron;
