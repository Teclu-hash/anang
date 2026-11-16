import { Button } from 'react-bootstrap'

//title on the left, optional add button on the right
const PageHeader = ({ title, buttonLabel, onButtonClick }) => {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h3 className="m-0">{title}</h3>
      {buttonLabel && <Button onClick={onButtonClick}>{buttonLabel}</Button>}
    </div>
  )
}

export default PageHeader
