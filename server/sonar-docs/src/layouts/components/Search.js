/*
 * SonarQube
 * Copyright (C) 2009-2019 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import React, { Component } from 'react';
import lunr from 'lunr';
import { sortBy } from 'lodash';
import ClearIcon from './icons/ClearIcon';
import { getUrlsList } from '../utils';

// Search component
export default class Search extends Component {
  index = null;
  input = null;

  constructor(props) {
    super(props);
    this.state = { value: '' };
    this.index = lunr(function() {
      this.use(tokenContextPlugin);
      this.ref('id');
      this.field('title', { boost: 10 });
      this.field('text');

      this.metadataWhitelist = ['position', 'tokenContext'];

      props.pages
        .filter(page =>
          getUrlsList(props.navigation).includes(page.frontmatter.url || page.fields.slug)
        )
        .forEach(page =>
          this.add({
            id: page.id,
            text: page.html.replace(/<(?:.|\n)*?>/gm, '').replace(/&#x3C;(?:.|\n)*?>/gm, ''),
            title: page.frontmatter.title
          })
        );
    });
  }

  getFormattedResults = (query, results) => {
    const formattedResults = results.map(match => {
      const page = this.props.pages.find(page => page.id === match.ref);
      const highlights = {};
      let longestTerm = '';
      let exactMatch = false;

      // Loop over all matching terms/tokens.
      Object.keys(match.matchData.metadata).forEach(term => {
        // Remember the longest term that matches the query as close as possible.
        if (query.includes(term.toLowerCase()) && longestTerm.length < term.length) {
          longestTerm = term;
        }

        Object.keys(match.matchData.metadata[term]).forEach(fieldName => {
          const { position: positions, tokenContext: tokenContexts } = match.matchData.metadata[
            term
          ][fieldName];

          highlights[fieldName] = [...(highlights[fieldName] || []), ...positions];

          // Check if we have an *exact match*.
          if (!exactMatch && tokenContexts) {
            tokenContexts.forEach(tokenContext => {
              if (!exactMatch && tokenContext.includes(query)) {
                exactMatch = true;
              }
            });
          }
        });
      });

      return {
        page: {
          id: page.id,
          text: page.html.replace(/<(?:.|\n)*?>/gm, '').replace(/&#x3C;(?:.|\n)*?>/gm, ''),
          title: page.frontmatter.title,
          url: page.frontmatter.url || page.fields.slug
        },
        exactMatch,
        highlights,
        query,
        longestTerm
      };
    });

    // Re-order results by the length of the longest matched term and by exact
    // match (if applicable). The longer the matched term is, the higher the
    // chance the result is more relevant.
    return sortBy(
      // Sort by longest term.
      sortBy(formattedResults, result => -result.longestTerm.length),
      // Sort by exact match.
      result => result.exactMatch && -1
    );
  };

  handleClear = event => {
    this.setState({ value: '' });
    this.props.onResultsChange([], '');
    if (this.input) {
      this.input.focus();
    }
  };

  handleChange = event => {
    const { value } = event.currentTarget;
    this.setState({ value });
    if (value !== '') {
      const results = this.getFormattedResults(value, this.index.search(`${value}~1 ${value}*`));
      this.props.onResultsChange(results, value);
    } else {
      this.props.onResultsChange([], value);
    }
  };

  render() {
    return (
      <div className="search-container">
        <input
          aria-label="Search"
          className="search-input"
          onChange={this.handleChange}
          placeholder="Search..."
          ref={node => (this.input = node)}
          type="search"
          value={this.state.value}
        />
        {this.state.value && (
          <button onClick={this.handleClear} type="button">
            <ClearIcon size="8" />
          </button>
        )}
      </div>
    );
  }
}

// Lunr doesn't support exact multiple-term matching. Meaning "foo bar" will not
// boost a sentence like "Foo bar baz" more than "Baz bar foo". In order to
// provide more accurate results, we store the token context, to see if we can
// perform an "exact match". Unfortunately, we cannot extend the search logic,
// only the tokenizer at *index time*. This is why we store the context as
// meta-data, and post-process the matches before rendering (see above). For
// performance reasons, we only add 2 extra tokens, one in front, one after.
// This means we support "exact macthing" for up to 3 terms. More search terms
// would fallback to the regular matching algorithm, which is OK: the more terms
// searched for, the better the standard algorithm will perform anyway. In the
// end, the best would be for Lunr to support multi-term matching, as extending
// the search algorithm for this would be way too complicated.
function tokenContextPlugin(builder) {
  const pipelineFunction = (token, index, tokens) => {
    const prevToken = tokens[index - 1] || '';
    const nextToken = tokens[index + 1] || '';
    token.metadata['tokenContext'] = [prevToken.toString(), token.toString(), nextToken.toString()]
      .filter(s => s.length)
      .join(' ')
      .toLowerCase();
    return token;
  };

  lunr.Pipeline.registerFunction(pipelineFunction, 'tokenContext');
  builder.pipeline.before(lunr.stemmer, pipelineFunction);
  builder.metadataWhitelist.push('tokenContext');
}
