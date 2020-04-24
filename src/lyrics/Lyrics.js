import React, { Component } from 'react';
import LyricsView from './LyricsView';
import {withRouter} from 'react-router-dom';

require('./lyrics.scss');
class Lyrics extends Component {
  constructor(props) {
    super(props);
    this.getLyrics = this.getLyrics.bind(this);
    this.player = null;
    this.currState = {};

    this.state = {
      lyrics: [],
      inputValue: 0,
      musicLength: 0,
      bubbleValue: 0,
      musicPosition: 0,
    }
  }

  onPlaySong = () => {
    const { spotifyUri  } = this.props.location.state.musicInfo;
    const play = ({
      spotify_uri,
      playerInstance: {
        _options: {
          getOAuthToken,
          id
        }
      }
    }) => {
      getOAuthToken(access_token => {
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
          method: 'PUT',
          body: JSON.stringify({ uris: [spotify_uri], position_ms: this.state.musicPosition || 0 }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
          },
        });
      });
    };
    play({
      playerInstance: window.spotifyPlayer,
      spotify_uri: spotifyUri,
    });
  }

  onPauseSong = () => {
    const { spotifyUri  } = this.props.location.state.musicInfo;
    const pause = ({
      spotify_uri,
      playerInstance: {
        _options: {
          getOAuthToken,
          id
        }
      }
    }) => {
      getOAuthToken(access_token => {
        console.log('id:', id)
        fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${id}`, {
          method: 'PUT',
          body: JSON.stringify({ uris: [spotify_uri] }),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
          },
        });
      });
    };
    pause({
      playerInstance: window.spotifyPlayer,
      spotify_uri: spotifyUri,
    });
  }

  getLyrics = async () => {
    try {
      const { lyrics } = await (await fetch(`/get_lyrics?artist=Sexion d'Assaut&song=wati bon son`)).json();
      this.setState({
        lyrics,
      });
    } catch (err) {
      console.log('There was an error in the getLyrics call:', err)
      return 'No lyrics found';
    } 
  }
  handleScroll = (e) => {
    const position = e.target.scrollTop + e.target.offsetHeight;
    const max = e.target.scrollHeight;
    const scrollContainer = document.getElementsByClassName('lyrics_scroll-area');
    const bottom = scrollContainer[0].getBoundingClientRect().bottom;
    const spans = document.getElementsByTagName('span');
    for(let i = 0; i < spans.length; i++) {
      const spanTop = spans[i].getBoundingClientRect().top;
      if (spanTop <= bottom || position === max) {
        spans[i].classList.add("lyrics_scroll-span");
      } else {
        spans[i].classList.remove("lyrics_scroll-span");
      }
    }
  }


  async componentDidMount() {
    const { songName, artist, imgUrl } = this.props.location.state.musicInfo;
    document.getElementById('background').style.backgroundImage = `url(${imgUrl})`;
    try {
      let { lyrics } = await (await fetch(`/get_lyrics?artist=${artist}&song=${songName}`)).json();
      lyrics = lyrics.split('\n').map(ly => ly.trim()).filter(le => le !== '');
      this.setState({
        lyrics: lyrics,
      })
    } catch (err) {
      console.log('There was an error in the getLyrics call:', err)
      this.setState({
        lyrics: 'No lyrics found'.split('\n'),
      })
    } 
  }
  componentWillUnmount(){
    this.onPauseSong();
  }
  render() {
    const { lyrics } = this.state;
    return (
      <div className='lyrics-container' id='background'>
        <LyricsView lyrics={lyrics}
          onPlaySong={this.onPlaySong}
          onPauseSong={this.onPauseSong}
          handleScroll={this.handleScroll}/>
      </div>
    )
  }
}

export default withRouter(Lyrics);