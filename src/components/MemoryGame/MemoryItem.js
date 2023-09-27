import "./MemoryItem.scss";

const MemoryItem = (props) => {
  return (
    <div className={`memory-item`} onClick={props.onClick} onMouseOver={props.onMouseOver} onMouseOut={props.onMouseOut} data-value={props.config.value}>
      <div className="content">
        <div className="content--front">
          {props.config.image && <img src={props.config.image} alt="memory-item"></img>}
          <span>{props.config.value}</span>
        </div>
        <div className="content--back">
          <span>Back {props.config.value}</span>
        </div>
        <div className="curtain"></div>
      </div>
    </div>
  );
};

export default MemoryItem;
