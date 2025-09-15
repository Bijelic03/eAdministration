import LinkButton from "../link-button";

interface TableProps {
  children: React.ReactNode;
  className?: string;
  hasAddButton?: boolean;
  addButtonLabel?: string;
  addButtonHref?: string;
}

const Table: React.FC<TableProps> = ({
  children,
  className,
  hasAddButton,
  addButtonLabel,
  addButtonHref,
}) => {
  return (
    <>
      {hasAddButton && (
        <>
          <div className="flex justify-end">
            <LinkButton href={addButtonHref || ''}>{addButtonLabel}</LinkButton>
          </div>
        </>
      )}

      <div
        className={`mx-auto max-w-[1350px] w-full border border-white ${className}`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            {children}
          </table>
        </div>
      </div>
    </>
  );
};

export default Table;
