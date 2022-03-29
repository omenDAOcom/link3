interface Props {
  title: string;
  error: Error | null;
  className?: string;
}

const labelError = (props: Props) => {
  const { title, error } = props;
  const errorMessage = error ? error.message : null;
  const className = props.className
    ? `flex justify-between items-center ${props.className}`
    : `flex justify-between items-center`;
  return (
    <>
      <div className={className}>
        <label
          className="label"
          htmlFor="title">{title}</label>
        {errorMessage && (
          <span className="error-label">{errorMessage}</span>
        )}
      </div>
    </>
  )
}

export default labelError