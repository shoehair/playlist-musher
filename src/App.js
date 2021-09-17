import React, { Component } from "react";
import * as $ from "jquery";
import { authEndpoint, clientId, redirectUri, scopes } from "./config";
import hash from "./hash";
import Player from "./Player";
import logo from "./logo.svg";
import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {
      token: null,
      item: {
        album: {
          images: [{ url: "" }]
        },
        name: "",
        artists: [{ name: "" }],
        duration_ms: 0
      },
      is_playing: "Paused",
      progress_ms: 0,
      no_data: false,
      friendssongs: new Set(),
      mysongs: new Set(),
      friend: ""
    };

    //this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
    this.getmysongs = this.getmysongs.bind(this);
    this.getFriendsSongs = this.getFriendsSongs.bind(this);
    this.getMySongsFromPlaylists = this.getMySongsFromPlaylists.bind(this);
    this.getAllSongsFromFriendsPlaylists = this.getAllSongsFromFriendsPlaylists.bind(this);
    this.combinePlaylists = this.combinePlaylists.bind(this);
    this.getCommonSongs = this.getCommonSongs.bind(this);
    this.dotheThing = this.doTheThing.bind(this);
    //this.testPlaylist = this.testPlaylist.bind(this);
    //this.tick = this.tick.bind(this);
  }



  componentDidMount() {
    // Set token
    let _token = hash.access_token;

    if (_token) {
      // Set token
      this.setState({
        token: _token
      });
      
      //this.getCommonSongs("mic_hell_e", _token);
      //this.combinePlaylists(_token);
      console.log("mounted");
    }

    // set interval for polling every 5 seconds
    this.interval = setInterval(() => this.tick(), 5000);
  }

  componentWillUnmount() {
    // clear the interval to save resources
    clearInterval(this.interval);
  }

  tick() {
    if(this.state.token) {
      this.combinePlaylists();
    }
  }

  doTheThing(){
    console.log(this.state.token);
    this.getCommonSongs("mtngdaner", this.state.token);
    //this.getCommonSongs("mic_hell_e", this.state.token);
  }

  getCommonSongs(friend, token) {

    this.getmysongs(token);
    this.setState({friend: friend}, () => {
      this.getFriendsSongs(token, friend);
    })
    
  }
  
  getmysongs(token) {
    // Make a call using the token
    console.log(token);
    console.log(this.state.friend);

    $.ajax({
      url: "https://api.spotify.com/v1/me/playlists",
      type: "GET",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: data => {
        // Checks if the data is not empty
        if(!data) {
          this.setState({
            no_data: true,
          });
          return;
        }
        var playlists = [];
        for (var i = 0; i < data.items.length; i++) {
          playlists.push(data.items[i].id);
        }

        this.setState({
          playlists: playlists,
          no_data: false /* We need to "reset" the boolean, in case the
                            user does not give F5 and has opened his Spotify. */
                        
        });

        this.getMySongsFromPlaylists(token);
      }
    });
  
  }

  getMySongsFromPlaylists(token) {
    for (let i = 0; i < this.state.playlists.length; i++) {
   //console.log(id);
      $.ajax({
        url: "https://api.spotify.com/v1/playlists/"+this.state.playlists[i]+"/tracks",
        async: true,
        type: "GET",
        beforeSend: xhr => {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
        },
        error: error => {
          console.log(error);
        },
        success: data => {
          // Checks if the data is not empty
          if(!data) {
            this.setState({
              no_data: true,
            });
            return;
          }
          var songs = this.state.mysongs;
          for (var i = 0; i < data.items.length; i++) {
            songs.add(data.items[i].track.name);
          }
        
  
        }
      });
    }

  }
    
  getFriendsSongs(token, userid) {
    $.ajax({
      url: "https://api.spotify.com/v1/users/" + userid + "/playlists",
      type: "GET",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: data => {
        // Checks if the data is not empty
        if(!data) {
          this.setState({
            no_data: true,
          });
          return;
        }
        var playlists = [];
        
        for (var i = 0; i < data.items.length; i++) {
          playlists.push(data.items[i].id);
        }

        this.setState({
          friendsplaylists: playlists,
          no_data: false /* We need to "reset" the boolean, in case the
                            user does not give F5 and has opened his Spotify. */
                        
        });
        this.getAllSongsFromFriendsPlaylists(token);
        
      }
    });
  }

  getAllSongsFromFriendsPlaylists(token) {

    for (let i = 0; i < this.state.friendsplaylists.length; i++) {
      //console.log(id);
         $.ajax({
           url: "https://api.spotify.com/v1/playlists/"+this.state.friendsplaylists[i]+"/tracks",
           async: true,
           type: "GET",
           beforeSend: xhr => {
             xhr.setRequestHeader("Authorization", "Bearer " + token);
           },
           error: error => {
             console.log(error);
           },
           success: data => {
             // Checks if the data is not empty
             if(!data) {
               this.setState({
                 no_data: true,
               });
               return;
             }
             var songs = this.state.friendssongs;
             for (var i = 0; i < data.items.length; i++) {
               songs.add(data.items[i].track.name);
             }
            
     
           }
         });
       }

       this.combinePlaylists();
     }


  getCurrentlyPlaying(token) {
    //console.log("bla");
    // Make a call using the token
    $.ajax({
      url: "https://api.spotify.com/v1/me/player",
      type: "GET",
      beforeSend: xhr => {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      },
      success: data => {
        // Checks if the data is not empty
        if(!data) {
          this.setState({
            no_data: true,
          });
          return;
        }

        this.setState({
          item: data.item,
          is_playing: data.is_playing,
          device_name: data.device.name,
          progress_ms: data.progress_ms,
          no_data: false
                        
        });
      }
    });
  }


  
  combinePlaylists() {
    this.setState({poop: "poop"});
    var intersection = new Set();
    var i = 0;
    for (var x of this.state.friendssongs) {
      i++;
      if (this.state.mysongs.has(x)) {
        intersection.add(x);
      }
    }

    var songs = "";
    for (var song of intersection) {
      songs += song + " , ";
    }
    this.setState(
      {intersection: songs + intersection.size}
    )

  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {!this.state.token && (
            <a
              className="btn btn--loginApp-link"
              href={`${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
                "%20"
              )}&response_type=token&show_dialog=true`}
            >
              Login to Spotify
            </a>
          )}

         
          
          <div>{this.state.intersection}</div>

          
          {this.state.token && !this.state.no_data && (
            <Player
              item={this.state.item}
              is_playing={this.state.is_playing}
              progress_ms={this.state.progress_ms}
            />
          )}
          {this.state.no_data && (
            <p>
              You need to be playing a song on Spotify, for something to appear here.
            </p>
          )}

          {this.state.token != null && 
            <button onClick={() => this.doTheThing()}>
              doTheThing
            </button>
          
          }
        </header>
      </div>
    );
  }
}

export default App;
