/* global Sortable */

(function(w) {
  'use strict';

  w.Bucketlist = function(params) {
    var self, sources, options, endpoints,
        bucket, region, x, y,
        xLen, yLen;

    self = this;
    sources = [params, w.bucketlistConfig];
    options = [
      'url',
      'limit'
    ];

    for (x = 0, xLen = sources.length; x < xLen; x++) {
      if (typeof sources[x] !== 'undefined') {
        for (y = 0, yLen = options.length; y < yLen; y++) {
          if (typeof sources[x][options[y]] !== 'undefined') {
            self[options[y]] = sources[x][options[y]];
          }
        }
      }
    }

    self.nameIcon = {
      file: 'glyphicon-file',
      directory: 'glyphicon-folder-close'
    };

    self.nameLabel = {
      file: 'label-success',
      directory: 'label-warning'
    };

    endpoints = {
      'ap-northeast-1': 's3-ap-northeast-1.amazonaws.com',
      'ap-southeast-1': 's3-ap-southeast-1.amazonaws.com',
      'ap-southeast-2': 's3-ap-southeast-2.amazonaws.com',
      'eu-west-1': 's3-eu-west-1.amazonaws.com',
      'us-east-1': 's3.amazonaws.com',
      'us-west-1': 's3-us-west-1.amazonaws.com',
      'us-west-2': 's3-us-west-2.amazonaws.com',
      'sa-east-1': 's3-sa-east-1.amazonaws.com'
    };

    if (typeof self.url === 'undefined') {
      self.url = w.location.host;
    }

    self.url = self.url.toLowerCase()
                       .replace(/^\b.*?\b:/, '')
                       .replace(/^\/{1,}/, '')
                       .replace(/\/{1,}$/, '')
                       .trim();

    if (self.url.indexOf('.s3-website-') !== -1) {
      self.url = self.url.split('.s3-website-');

      bucket = self.url[0].replace(/^\/{1,}/, '')
                          .trim();

      region = self.url[1].split('.amazonaws.com')[0]
                          .replace(/^\/{1,}/, '')
                          .replace(/\/{1,}$/, '')
                          .trim();

      self.url = endpoints[region] + '/' + bucket;
    } else {
      for (var z in endpoints) {
        if (self.url === endpoints[z]) {
          bucket = self.url.split('/')[1]
                           .replace(/^\/{1,}/, '')
                           .replace(/\/{1,}$/, '')
                           .trim();

          self.url = self.url + '/' + bucket;

          break;
        }
      }
    }

    self.url = '//' + self.url;

    self.url = $('<a></a>').attr('href', self.url)[0];

    self.url = '//' + self.url.hostname + self.url.pathname;

    self.url = self.url.replace(/\/{1,}$/, '')
                       .trim();

    if (typeof self.limit === 'number') {
      self.limit = parseInt(self.limit, 10);
    }

    if (isNaN(self.limit) || self.limit <= 0) {
      self.limit = 100;
    }

    self.delimiter = '/';

    self.title = document.title.trim();

    if (self.title === '') {
      self.title = 'Bucketlist';
    }

    $(function() {
      self.$title = $('#bucketlist-title');
      self.$container = $('#bucketlist-container');
      self.$breadcrumb = $('#bucketlist-breadcrumb');
      self.$tableBase = $('#bucketlist-table-base');
      self.$tableContainer = $('#bucketlist-table-container');
      self.$pagerContainer = $('#bucketlist-pager-container');
      self.$loaderContainer = $('#bucketlist-loader-container');
      self.$errorContainer = $('#bucketlist-error-container');
      self.$errorHeading = $('#bucketlist-error-heading');
      self.$errorRetry = $('#bucketlist-error-retry');

      self.assignTableSelector();

      self.$title.text(self.title);

      self.$pagerContainer.on('click', 'LI:not(.disabled) > A', function() {
        var action = $(this).parent().attr('class');

        if (typeof action !== 'undefined') {
          self.navigatePaginator({
            action: action
          });
        }
      });

      $(w).on('hashchange', function() {
        self.init();
      });

      self.init();
    });
  };

  w.Bucketlist.prototype.init = function() {
    this.resetPage();
    this.resetMarker();
    this.navigate();
  };

  w.Bucketlist.prototype.resetPage = function() {
    this.page = 0;
  };

  w.Bucketlist.prototype.resetMarker = function() {
    this.marker = {
      current: '',
      index: ['']
    };
  };

  w.Bucketlist.prototype.assignTableSelector = function() {
    this.$table = $(
      '#bucketlist-table-container > TABLE.bucketlist-table:first'
    );
  };

  w.Bucketlist.prototype.showContainer = function(container) {
    container.removeClass('hidden');
  };

  w.Bucketlist.prototype.hideContainer = function(container) {
    container.addClass('hidden');
  };

  w.Bucketlist.prototype.navigate = function() {
    var self, hash, params;

    self = this;
    hash = w.location.hash.replace(/^#!\//, '')
                          .trim();

    hash = decodeURIComponent(hash);

    params = {
      prefix: hash,
      delimiter: self.delimiter,
      marker: self.marker.current,
      'max-keys': self.limit
    };

    self.fetchList(params);
  };

  w.Bucketlist.prototype.fetchList = function(params) {
    var self = this;

    self.hideContainer(self.$container);
    self.hideContainer(self.$errorContainer);
    self.showContainer(self.$loaderContainer);

    self.$table.empty().remove();

    self.$tableContainer.empty()
                        .html(self.$tableBase.html())
                        .find('TABLE:first')
                        .addClass('bucketlist-table');

    self.assignTableSelector();

    $.ajax({
      url: self.url,
      dataType: 'xml',
      data: params,
      success: function(res) {
        self.parseReturn({
          xml: res,
          prefix: params.prefix
        });
      },
      error: function(err) {
        self.ajaxErrorHandler({
          error: err,
          retry: params
        });
      }
    });
  };

  w.Bucketlist.prototype.ajaxErrorHandler = function(params) {
    var self, heading;

    self = this;
    heading = '';

    if (typeof params.error !== 'undefined') {
      if (typeof params.error.status !== 'undefined' &&
          params.error.status !== 0) {
        heading = params.error.status + ': ';
      }

      if (typeof params.error.statusText !== 'undefined' &&
          params.error.statusText !== 'error') {
        heading += params.error.statusText;
      }
    }

    if (heading === '') {
      heading = 'Error';
    }

    self.$errorHeading.empty().text(heading);

    self.$errorRetry.one('click', function() {
      self.fetchList(params.retry);
    });

    self.hideContainer(self.$container);
    self.hideContainer(self.$loaderContainer);
    self.showContainer(self.$errorContainer);
  };

  w.Bucketlist.prototype.parseReturn = function(params) {
    var self, list, xml, marker;

    self = this;
    list = {};
    xml = $(params.xml);
    marker = '';

    list.files = $.map(xml.find('Contents'), function(x) {
      x = $(x);

      return {
        name: x.find('Key:first').text(),
        lastModified: x.find('LastModified:first').text(),
        size: x.find('Size:first').text(),
        type: 'file'
      };
    });

    list.dirs = $.map(xml.find('CommonPrefixes'), function(x) {
      x = $(x);

      return {
        name: x.find('Prefix:first').text(),
        lastModified: '',
        size: '0',
        type: 'directory'
      };
    });

    marker = xml.find('NextMarker');
    marker = marker.length !== 0 ?
             marker.text() :
             '';

    if (marker !== '') {
      self.marker.index[self.page + 1] = marker;
    }

    self.generateTable({
      list: list,
      prefix: params.prefix
    });

    self.generateBreadcrumb({
      prefix: params.prefix
    });

    self.updatePaginator();

    self.hideContainer(self.$loaderContainer);
    self.showContainer(self.$container);
  };

  w.Bucketlist.prototype.parseItemSize = function(params) {
    switch(params.bytes) {
      case undefined:
      case null:
      case '':
      case '0':
      case 0:
        return '--';
    }

    var sizes, i;

    sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    i = parseInt(Math.floor(Math.log(params.bytes) / Math.log(1024)), 10);

    return Math.round(params.bytes / Math.pow(1024, i), 2) +
           ' ' +
           sizes[i];
  };

  w.Bucketlist.prototype.generateTable = function(params) {
    var self, tbody, row;

    self = this;
    tbody = [];

    row = $([
      '<tbody>',
      '<tr>',
      '<td class="type text-center">',
      '<span class="label">',
      '<span class="glyphicon"></span>',
      '</span>',
      '</td>',
      '<td class="name">',
      '<a class="bucketlist-name-link"></a>',
      '</td>',
      '<td class="last-modified"></td>',
      '<td class="size"></td>',
      '</tr>',
      '</tbody>'
    ].join(''));

    for (var x in params.list) {
      var res, y, len;

      res = params.list[x];

      for (y = 0, len = res.length; y < len; y++) {
        var type, name, lastModified, size,
            url, attr;

        type = res[y].type;

        name = typeof res[y].name !== 'undefined' ?
               res[y].name :
               '--';

        if (name !== '--') {
          name = name.replace(
            new RegExp('^' + params.prefix),
            '',
            'i'
          ).trim();
        }

        if (name !== '') {
          row.find('tr:first')
             .attr('class', res[y].type)
             .find('TD.type')
             .attr('data-value', res[y].type)
             .find('SPAN.label')
             .addClass(self.nameLabel[res[y].type])
             .find('SPAN.glyphicon')
             .addClass(self.nameIcon[res[y].type]);

          lastModified = {
            parsed: new Date(
              typeof res[y].lastModified === 'string' &&
              res[y].lastModified !== '' ?
              res[y].lastModified :
              0
            )
          };

          lastModified.raw = lastModified.parsed.getTime() / 1000;

          lastModified.parsed = lastModified.parsed.getTime() === 0 ?
                                '--' :
                                lastModified.parsed;

          size = {
            raw: typeof res[y].size === 'string' &&
                 res[y].size !== '' ?
                 res[y].size :
                 0
          };

          size.parsed = self.parseItemSize({bytes: size.raw});

          url = name;

          switch (type) {
            case 'directory':
              url = '#!/' + encodeURIComponent(params.prefix + url);
              break;
            default:
              url = self.url + '/' + params.prefix + url;
              break;
          }

          attr = {
            name: {
              href: url,
              download: type === 'directory' ?
                        null :
                        name
            }
          };

          row.find('TD.size:first')
             .attr('data-value', size.raw)
             .text(size.parsed);

          row.find('TD.last-modified:first')
             .attr('data-value', lastModified.raw)
             .text(lastModified.parsed);

          row.find('TD.name:first A:first')
             .text(name)
             .attr(attr.name);

          tbody.push(row.html());
        }
      }
    }

    self.assignTableSelector();

    self.$table
        .attr('data-sortable', '')
        .find('tbody:first')
        .empty()
        .html(tbody.join(''));

    Sortable.init();
  };

  w.Bucketlist.prototype.updatePaginator = function() {
    var self, previous, next;

    self = this;
    previous = self.$pagerContainer.find('LI.previous:first');
    next = self.$pagerContainer.find('LI.next:first');

    self.hideContainer(self.$pagerContainer);

    previous.addClass('disabled');
    next.addClass('disabled');

    if (self.page > 0) {
      previous.removeClass('disabled');
    }

    if (self.page < self.marker.index.length - 1) {
      next.removeClass('disabled');
    }

    if (!previous.hasClass('disabled') || !next.hasClass('disabled')) {
      self.showContainer(self.$pagerContainer);
    }
  };

  w.Bucketlist.prototype.navigatePaginator = function(params) {
    var self, step;

    self = this;

    if (typeof params.action === 'string') {
      switch (params.action) {
        case 'previous':
          self.page--;
          break;
        case 'next':
          self.page++;
          break;
      }

      step = self.marker.index[self.page];

      if (typeof step === 'string') {
        self.marker.current = step;
        self.navigate();
      }
    }
  };

  w.Bucketlist.prototype.generateBreadcrumb = function(params) {
    var self, crumbs, li, ol,
        prefix, len, x;

    self = this;

    crumbs = [];

    if (typeof params.prefix === 'string') {
      crumbs = params.prefix.split('/');
    }

    li = $('<ol><li><a class="bucketlist-nav" href="#!/">Home</a></li></ol>');
    ol = [li.html()];
    prefix = '#!/';
    len = crumbs.length;

    if (len > 1) {
      for (x = 0, len = len - 1; x < len; x++) {
        var text = crumbs[x].trim();

        prefix = prefix + text + '/';

        li.find('LI:first > A:first')
          .text(text)
          .attr('href', prefix);

        ol.push(li.html());
      }
    }

    self.$breadcrumb
        .empty()
        .html(ol.join(''));
  };
})(window);
