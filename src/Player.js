import React, {Component}from "react";
import "./Player.css";
import Song from "./Song";

class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      songs_added: new Set()
    };
    this.onChildClicked = this.onChildClicked.bind(this);
  }

  onChildClicked(songName) {
    if (this.state.songs_added.has(songName)) {
      this.state.songs_added.delete(songName);
      this.setState({songs_added: this.state.songs_added});
    }
    else {
      this.state.songs_added.add(songName);
      this.setState({songs_added: this.state.songs_added});
    }
    this.props.func(this.state.songs_added);
  }


  //{props.songs.map((object, i) => <Song name={object[0].name} key={i} />)}
  //{props.foundASong && <div className="song_container">{props.songs.map((object, i) => <Song object={object} key={i} />)}</div>}

  render() {
    return (
      <div className="App">
        <div className="main-wrapper">
          
        {this.props.foundASong && <div className="song_container">{this.props.songs.map((object, i) => <Song object={object} key={i} func={this.onChildClicked}/>)}</div>}
          
        </div>
      </div>
    );
  }
}

export default Player;
