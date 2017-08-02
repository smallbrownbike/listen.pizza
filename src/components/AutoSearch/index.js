import _ from 'lodash'
import React, { Component } from 'react'
import { Search, Grid, Popup } from 'semantic-ui-react'
import {withRouter} from "react-router-dom";
import ReactDOM from 'react-dom';
import {Link} from 'react-router-dom';

let source;
class SearchBar extends Component {
  componentWillMount() {
    this.resetComponent()
  }

  handleKeyPress = (e) => {
    if(e.key === 'Enter'){
      ReactDOM.findDOMNode(this).querySelector('input').blur();
      this.setState({value: ''})
      this.props.history.push('/artist/' + this.state.value)
      this.setState({showResults: false, show: false})
    }
  }

  resetComponent = () => {this.setState({ isLoading: false, results: [], value: '' })}

  handleResultSelect = (e, result) => {
    
    Object.keys(result).length === 2 ?
    window.location.pathname.startsWith('/artist/') ?
    window.location.pathname = '/artist/' + encodeURIComponent(result.title) :
    this.props.history.push('/artist/' + encodeURIComponent(result.title)) :
    window.location.pathname.startsWith('/album/') ?
    window.location.pathname = '/album/' + encodeURIComponent(result.description) + '+' + encodeURIComponent(result.title) :
    this.props.history.push('/album/' + encodeURIComponent(result.description) + '+' + encodeURIComponent(result.title))
    this.setState({value: '', showResults: false})}

  handleSearchChange = (e, value) => {
    this.setState({ show: false, isLoading: true, value })

    setTimeout(() => {
      if (this.state.value.length < 1) return this.resetComponent()

      const re = new RegExp(_.escapeRegExp(this.state.value), 'i')
      const isMatch = (result) => re.test(result.title + ' ' + result.description)

      const filteredResults = _.reduce(source, (memo, data, name) => {
        const results = _.filter(data.results, isMatch)

        if (results.length) {
          memo[name] = { name, results }
        }

        return memo
      }, {})

      this.setState({
        isLoading: false,
        results: filteredResults,
      })
    }, 500)
  }

  render() {
    const { isLoading, value, results } = this.state
    return (
      <Popup
        trigger={
          <Grid>
            <Grid.Column width={8}>
              <Search
                category
                minCharacters={3}
                loading={this.props.authed ? isLoading : false}
                onResultSelect={this.handleResultSelect}
                onSearchChange={this.handleSearchChange}
                results={results}
                value={value}
                placeholder = {'Search...'}
                onKeyPress={this.handleKeyPress}
                showNoResults={this.props.authed ? this.state.showResults : false}
                noResultsMessage={'Not in collection.'}
                noResultsDescription={'Hit enter to search by artist.'}
                onFocus={() => {if(this.props.authed){source = this.props.collection; !this.props.random ? this.setState({show: false, showResults: true}) : this.setState({showResults: true});}else{this.setState({show: false});return}}}
              />
            </Grid.Column>
          </Grid>
        }
        open={this.state.show}
        position='bottom center'
        size='small'
        flowing={false}
        header='Looking for something new?'
        content={<div>Check out <Link onClick={() => {this.setState({show: false})}} to={'/artist/' + this.props.random}>{this.props.random}</Link></div>}
        on='click'
        hideOnScroll={false}
      />         
    )
  }
}

export default withRouter(SearchBar)