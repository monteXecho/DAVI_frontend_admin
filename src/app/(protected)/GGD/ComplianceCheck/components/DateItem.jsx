import { useI18n } from "../../contexts/i18n/I18nContext";

const DateItem = ({ date }) => {
  const { t } = useI18n();

  const getDayOfWeekFromDDMMYYYY = (dateStr) => {
    if (typeof dateStr !== "string") return null;

    const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(dateStr);
    if (!m) return null;

    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);

    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;

    const d = new Date(Date.UTC(yyyy, mm - 1, dd));

    if (
      d.getUTCFullYear() !== yyyy ||
      d.getUTCMonth() !== mm - 1 ||
      d.getUTCDate() !== dd
    ) {
      return null;
    }

    return d.getUTCDay();
  };

  const day = getDayOfWeekFromDDMMYYYY(date);

  return (
    <div className="text-nowrap">
      {date} {day && <>({t("days")[day]})</>}
    </div>
  );
};

export default DateItem;
