export const MONTH_YEAR_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

export const FULL_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export const SHORT_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
