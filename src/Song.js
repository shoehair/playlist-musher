import React, { Component } from "react";
import "./Song.css";

class Song extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clicked: false
    };

    this.changeBackground = this.changeBackground.bind(this);
    this.handleClick = this.handleClick.bind(this);

  }

  handleClick() {
    console.log("clicked");
    this.setState(prevState => ({
      clicked: !prevState.clicked
    }));
    this.props.func(this.props.object);
  }

  changeBackground(e) {
    //e.target.style.background = 'red';
    console.log("hovered");
  }
  

  render(){
    let btn_class = this.state.clicked ? "clicked" : "unclicked";
    return(
    <div>
        <div className={btn_class} onMouseOver={this.changeBackground} onClick={this.handleClick}> 
            <img src={this.props.object.album.images[0].url} />
          <div>{this.props.object.name}</div> 
        </div>
      </div>);
    

    }
}

export default Song;

/*const Song = props => {


  return (
    <div>
      <button onClick = {() => console.log("poopytime")}> boob! </button>
    </div>
  
    /*<div className="song_box">
        <img src={props.object.album.images[0].url} />
      <div>{props.object.name}</div> 
    </div>
  );
}

export default Song;*/
