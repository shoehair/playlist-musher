import "./ProgressBar.css";
import React, {Component}from "react";


class ProgressBar extends Component {
    constructor(props) {
      super(props);
      this.getProgressBarStyle = this.getProgressBarStyle.bind(this);
      this.getProgressText = this.getProgressText.bind(this);
    }
  
    getProgressBarStyle() {
      if (this.props.totalmyplaylists + this.props.totalfriendplaylists == 0) {
        return {width: 0};
      }
      return {width: ((this.props.myplaylistsdone + this.props.friendplaylistsdone)* 100 / (this.props.totalmyplaylists + this.props.totalfriendplaylists)) + '%'};
    }
  
    getProgressText() {
      if (this.props.totalmyplaylists + this.props.totalfriendplaylists == 0) {
        return "";
      }
      return (this.props.myplaylistsdone + this.props.friendplaylistsdone) + "/" + (this.props.totalmyplaylists + this.props.totalfriendplaylists) + " playlists looked at";
    }

    render() {
      return (
          <div className="progress_container">
            <div className="progress">
                <div className="progress__bar" style={this.getProgressBarStyle()} />
            </div>
            <div>
                {this.getProgressText()}
            </div>
          </div>

      );
    }
  }
  
export default ProgressBar;