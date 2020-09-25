$(document).ready(function driveupload(options) {
  // let redirect_uri = 'http://127.0.0.1:5500/upload.html';
  // let client_id = '571272215300-244pkdu9ipqblh5cbul452phrh6nkth1.apps.googleusercontent.com';
  // var clientId = "571272215300-244pkdu9ipqblh5cbul452phrh6nkth1.apps.googleusercontent.com";
  // let client_secret = 'JX_4Pi6pQHXwNSzMkJnsmU19';
  //   let button_one = options.buttonOne;
  //   let button_two = options.buttonTwo;
  //   let image_input = options.imageInput;
  let redirect_uri = options.redirectUri;
  let client_id =  options.clientId;
  var clientId =  options.clientId;
  let client_secret =  options.clientSecret;
  let button_one = "#login";
  let button_two = "#upload";
  let image_input = "#files";

  // ==================================================================================>

  var scope = "https://www.googleapis.com/auth/drive";
  var url = "";
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  //   const scope = "https://www.googleapis.com/auth/drive";
  var access_token = "";

  // ==================================================================================>

  $(button_one).click(function () {
    signIn(clientId, redirect_uri, scope, url);
  });

  function signIn(clientId, redirect_uri, scope, url) {
    url =
      "https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=" +
      redirect_uri +
      "&prompt=consent&response_type=code&client_id=" +
      clientId +
      "&scope=" +
      scope +
      "&access_type=offline";

    window.location = url;
  }

  // ===================================================================================>

  $.ajax({
    type: "POST",
    url: "https://www.googleapis.com/oauth2/v4/token",
    data: {
      code: code,
      redirect_uri: redirect_uri,
      client_secret: client_secret,
      client_id: client_id,
      scope: scope,
      grant_type: "authorization_code",
    },
    dataType: "json",
    success: function (resultData) {
      localStorage.setItem("accessToken", resultData.access_token);
      localStorage.setItem("refreshToken", resultData.refreshToken);
      localStorage.setItem("expires_in", resultData.expires_in);
      window.history.pushState(
        {},
        document.title,
        "/GitLoginApp/" + "upload.html"
      );
    },
  });

  function stripQueryStringAndHashFromPath(url) {
    return url.split("?")[0].split("#")[0];
  }

  var Upload = function (file) {
    this.file = file;
  };

  Upload.prototype.getType = function () {
    localStorage.setItem("type", this.file.type);
    return this.file.type;
  };
  Upload.prototype.getSize = function () {
    localStorage.setItem("size", this.file.size);
    return this.file.size;
  };
  Upload.prototype.getName = function () {
    return this.file.name;
  };
  Upload.prototype.doUpload = function () {
    var that = this;
    var formData = new FormData();

    // add assoc key values, this will be posts values
    formData.append("file", this.file, this.getName());
    formData.append("upload_file", true);

    $.ajax({
      type: "POST",
      beforeSend: function (request) {
        request.setRequestHeader(
          "Authorization",
          "Bearer" + " " + localStorage.getItem("accessToken")
        );
      },
      url: "https://www.googleapis.com/upload/drive/v2/files",
      data: {
        uploadType: "media",
      },
      xhr: function () {
        var myXhr = $.ajaxSettings.xhr();
        if (myXhr.upload) {
          myXhr.upload.addEventListener(
            "progress",
            that.progressHandling,
            false
          );
        }
        return myXhr;
      },
      success: function (data) {
        console.log(data);
      },
      error: function (error) {
        console.log(error);
      },
      async: true,
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      timeout: 60000,
    });
  };

  Upload.prototype.progressHandling = function (event) {
    var percent = 0;
    var position = event.loaded || event.position;
    var total = event.total;
    var progress_bar_id = "#progress-wrp";
    if (event.lengthComputable) {
      percent = Math.ceil((position / total) * 100);
    }
    // update progressbars classes so it fits your code
    $(progress_bar_id + " .progress-bar").css("width", +percent + "%");
    $(progress_bar_id + " .status").text(percent + "%");
  };

  $(button_two).on("click", function (e) {
    var file = $(image_input)[0].files[0];
    var upload = new Upload(file);

    // maby check size or type here with upload.getSize() and upload.getType()

    // execute upload
    upload.doUpload();
  });
});

// module.exports.driveupload = driveupload;
