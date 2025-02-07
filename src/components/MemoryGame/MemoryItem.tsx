import "./MemoryItem.scss";
import {JSX} from "react";

interface MemoryItemProps {
  uid: any;
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseOver: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onMouseOut: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  config: {
    value: string;
    image?: string;
  };
}

const MemoryItem: (props) => JSX.Element = (props) => {
  return (
    <div
      className="memory-item"
      onClick={props.onClick}
      onMouseOver={props.onMouseOver}
      onMouseOut={props.onMouseOut}
      data-value={props.config.value}
    >
      <div className="content">
        <div className="content--front">
          <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 530">
            <use xlinkHref="#triforce" />
          </svg>
          <div className="curtain"></div>
          {/* <span>{props.config.value}</span> */}
        </div>
        <div className="content--left">
          <div className="curtain"></div>
        </div>
        <div className="content--right">
          <div className="curtain"></div>
        </div>
        <div className="content--back">
          {props.config.image && <img src={props.config.image} alt="memory-item" />}
          {/* <span>Back {props.config.value}</span> */}
          <div className="curtain"></div>
        </div>
      </div>
    </div>
  );
};

export default MemoryItem;