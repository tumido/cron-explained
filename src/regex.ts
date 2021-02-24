enum SpecialCase {
    dayOfWeek, dayOfMonth, month, none
}
const toRange = (unit: String): String => `(${unit})(-(${unit}))?`;

const verboseMonthsRange = toRange("JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC");
const verboseDayOfWeekRange = toRange("MON|TUE|WED|THU|FRI|SAT|SUN");

const mapBaseRegex = (unit: String, specialCase: SpecialCase = SpecialCase.none): String => {
    if (specialCase === SpecialCase.dayOfMonth) { unit = `(${unit})|((${unit})L)|(L(${unit}))|L`; }

    let range = specialCase === SpecialCase.dayOfWeek
        ? `((${unit})|\\*)((-|\\/|,|#)(${unit}))*`
        : `((${unit})|\\*)((-|\\/|,)(${unit}))*`;

    if (specialCase === SpecialCase.dayOfWeek) { range += "L?"; }

    let result = `\\?|\\*|(${range}(,${range})*)`;

    if (specialCase === SpecialCase.dayOfMonth) { result += `|((${unit})W)|(W(${unit}))|W|WL|LW`; }
    if (specialCase === SpecialCase.dayOfWeek) { result += `|${verboseDayOfWeekRange}(,${verboseDayOfWeekRange})*|L`; }
    if (specialCase === SpecialCase.month) { result += `|${verboseMonthsRange}(,${verboseDayOfWeekRange})*`; }

    return `(${result})`;
};
export const longFormatCron =
    "(?<!(\\d|\\w))" +
    `(${mapBaseRegex("[0-5]?\\d")}\\s+)?` +
    [
        mapBaseRegex("[0-5]?\\d"),
        mapBaseRegex("[01]?\\d|2[0-3]"),
        mapBaseRegex("0?[1-9]|[12]\\d|3[01]", SpecialCase.dayOfMonth),
        mapBaseRegex("[1-9]|1[012]", SpecialCase.month),
        mapBaseRegex("[0-7]", SpecialCase.dayOfWeek),
    ].join("\\s+") +
    `(\\s+${mapBaseRegex("\\d{4}")})?` +
    "(?!(\\d|\\w))";

export default longFormatCron;
