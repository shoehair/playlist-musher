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
    };

    //this.getCurrentlyPlaying = this.getCurrentlyPlaying.bind(this);
    this.getAllSongs = this.getAllSongs.bind(this);
    this.getUsersSongs = this.getUsersSongs.bind(this);
    this.getAllSongsFromPlaylists = this.getAllSongsFromPlaylists.bind(this);
    this.getAllSongsFromUsersPlaylists = this.getAllSongsFromUsersPlaylists.bind(this);
    this.combinePlaylists = this.combinePlaylists.bind(this);
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
      //this.getUsersSongs(_token, "mic_hell_e");
      this.getAllSongs(_token);
      //this.combinePlaylists(_token);
      console.log("mounted");
      //this.testPlaylist(_token);
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
      //this.getAllPlaylists(this.state.token);
      //this.getCurrentlyPlaying(this.state.token);
      this.combinePlaylists();
    }
  }
  
    
    
  getUsersSongs(token, userid) {
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
          user2playlists: playlists,
          user2songs:new Set(),
          no_data: false /* We need to "reset" the boolean, in case the
                            user does not give F5 and has opened his Spotify. */
                        
        });
        this.getAllSongsFromUsersPlaylists(token);
        
      }
    });
  }

  getAllSongsFromUsersPlaylists(token) {

    for (let i = 0; i < this.state.user2playlists.length; i++) {
      //console.log(id);
         $.ajax({
           url: "https://api.spotify.com/v1/playlists/"+this.state.user2playlists[i]+"/tracks",
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
             var songs = this.state.user2songs;
             for (var i = 0; i < data.items.length; i++) {
               songs.add(data.items[i].track.name);
             }
            
     
           }
         });
       }
       console.log("here");
       console.log("user2", this.state);
       this.combinePlaylists();
       //console.log("user2", this.state);
       //var intersection = this.state.songs.filter(x => this.state.user2songs.has(x));
       //console.log(this.state.songs);
       //console.log(this.state.user2songs);
       //console.log("heyyyy", this.state);
    /*this.setState({
      intersection: intersection
    })*/

     }
  
  



  getAllSongs(token) {
    // Make a call using the token
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
          songs:new Set(),
          no_data: false /* We need to "reset" the boolean, in case the
                            user does not give F5 and has opened his Spotify. */
                        
        });

        this.getAllSongsFromPlaylists(token);
      }
    });
  
  }

  getAllSongsFromPlaylists(token) {
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
          var songs = this.state.songs;
          for (var i = 0; i < data.items.length; i++) {
            songs.add(data.items[i].track.name);
          }
        
  
        }
      });
    }
    this.getUsersSongs(token, "mic_hell_e");


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
    for (var x of this.state.user2songs) {
      i++;
      if (this.state.songs.has(x)) {
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

    //var intersection = this.state.songs.filter(x => this.state.user2songs.has(x));
    //(x => this.state.allsongs[1].has(x));

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
        </header>
      </div>
    );
  }
}

export default App;
