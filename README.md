Bucketlist
==========

An Apache-like index for viewing the file and directory listing of an Amazon S3 bucket.

__Demo__: http://bucketlist-demo.s3-website-ap-southeast-2.amazonaws.com/

## About
In this repo, the ``src`` directory contains the unminified source, and
the ``public`` directory contains the latest (minified) build. When using
Bucketlist, you can either go with the "drop-in" solution and use
``public/index.html``, which has all of it's references to static assets
pointing to a Cloudfront CDN containing the latest release, or you could
go with ``src`` just and host the whole kit and kaboodle yourself.

## Prerequisites
* Edit your S3 bucket's permissions
  * Enable "List" permissions for the grantee "Everyone"
    * http://docs.aws.amazon.com/AmazonS3/latest/UG/EditingBucketPermissions.html
  * Add a rule to the CORS configuration to allow all origins ("*") to GET
    * http://docs.aws.amazon.com/AmazonS3/latest/dev/cors.html#how-do-i-enable-cors

## Configuration
Bucketlist is flexible - it can be used with any S3 bucket in any region,
with or without S3's static website hosting enabled. You can put the index
within the bucket itself, in another S3 bucket, or anywhere else you'd like.

### Hosted in the same S3 bucket
* Fetch either [public/index.html](https://github.com/PatrickStankard/bucketlist/blob/master/public/index.html),
  or the contents of [src](https://github.com/PatrickStankard/bucketlist/blob/master/src)
* Update the ``title`` and the ``description`` tags at the top of ``index.html``
* Upload it to your bucket

### Hosted in another S3 bucket, or anywhere else
* Fetch either [public/index.html](https://github.com/PatrickStankard/bucketlist/blob/master/public/index.html),
  or the contents of [src](https://github.com/PatrickStankard/bucketlist/blob/master/src)
* Update the ``title`` and the ``description`` tags at the top of ``index.html``
* Uncomment the ``url`` key in the ``window.bucketlistConfig`` object
  at the top of ``index.html``
  * Change it to the URL of your S3 bucket
* Upload it to wherever you'd like to host it

## Options
Bucketlist takes 2 user configurable options in the form of the
``window.bucketlistConfig`` object, which can be found in the top of
``index.html``. To modify an option, simply uncomment it and change
it's value.

* __url__
  * The URL of the S3 bucket you'd like to generate a
    Bucketlist for
  * Default: the current ``window.location.host``
* __limit__
  * The number of results per page
  * Default: 100

## Credits
Bucketlist uses:
* [jQuery](https://github.com/jquery/jquery)
* [Bootstrap](https://github.com/twbs/bootstrap)
* [Sortable](https://github.com/HubSpot/sortable)
