import Axios from "axios";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import "./App.css";

const App = () => {
  const [isSending, setIsSending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [startUploading, setStartUploading] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailFrom, setEmailFrom] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [link, setLink] = useState("");
  const linkInputRef = useRef(null);

  useEffect(() => {
    let timer = setTimeout(() => toastMessage && setToastMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleUpload = (files: FileList) => {
    setStartUploading(true);
    const formData = new FormData();
    formData.append("myFile", files[0]);

    Axios.post(process.env.REACT_APP_API_URL + "/api/files", formData, {
      onUploadProgress: (event) => {
        const { loaded, total } = event;
        const percent = Math.floor((loaded * 100) / total);
        setUploadPercentage(percent);
      },
    })
      .then((res) => {
        if (res.data) {
          setLink(res.data.file);
          setStartUploading(false);
          setUploadPercentage(0);
          setToastMessage("Success: Uploaded...");
        }
      })
      .catch((err) => {
        console.error(err.message);
        setStartUploading(false);
        setUploadPercentage(0);
        setToastMessage("Error: " + err.message + "...");
      });
  };

  const handleCopyLinkClick = () => {
    // @ts-ignore
    linkInputRef?.current?.select();
    document.execCommand("copy");
    setToastMessage("Success: Copied...");
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    const hashId = link.split("/").splice(-1, 1)[0];

    const formData = {
      uuid: hashId,
      emailTo,
      emailFrom,
    };

    Axios.post(process.env.REACT_APP_API_URL + "/api/files/send", formData)
      .then((res) => {
        if (res.data.success) {
          setLink("");
          setEmailTo("");
          setEmailFrom("");
          setIsSending(false);
          setToastMessage("Success: Email sent...");
        }
      })
      .catch((err) => {
        console.log(err);
        setIsSending(false);
        setToastMessage("Error: " + err.message + "...");
      });
  };

  return (
    <div className="upload-container">
      <div
        className={`drop-zone ${isDragging ? "dragged" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const files = e.dataTransfer.files;
          if (files && files.length) {
            handleUpload(files);
          }
        }}
      >
        <div className="icon-container">
          <img
            src="/images/file.svg"
            alt="drop file"
            draggable="false"
            className="center"
          />
          <img
            src="/images/file.svg"
            alt="drop file"
            draggable="false"
            className="left"
          />
          <img
            src="/images/file.svg"
            alt="drop file"
            draggable="false"
            className="right"
          />
        </div>
        <div className="title">
          Drop your files here or,{" "}
          <span>
            <label>
              browse
              <input
                type="file"
                hidden
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length) {
                    handleUpload(files);
                  }
                }}
              />
            </label>
          </span>
        </div>
      </div>
      <div
        className="progress-container"
        style={{ display: startUploading ? "block" : "none" }}
      >
        <div
          className="bg-progress"
          style={{ width: `${uploadPercentage}%` }}
        />
        <div className="progress-info">
          <div className="progress-title">Uploading...</div>
          <div className="progress-percent">{uploadPercentage}%</div>
          <div
            className="progress-bar"
            style={{ width: `${uploadPercentage}%` }}
          />
        </div>
      </div>
      <div
        className="sharing-container"
        style={{ display: link ? "block" : "none" }}
      >
        <p className="expire-notice">Link expires in 24 hrs</p>
        <div className="expire-input">
          <input ref={linkInputRef} type="text" readOnly value={link} />
          <img
            src="/images/copy-icon.svg"
            alt="copy text"
            onClick={handleCopyLinkClick}
          />
        </div>
      </div>
      <div
        className="form-container"
        style={{ display: link ? "block" : "none" }}
      >
        <p className="form-title">Or Send Via Email</p>
        <form onSubmit={handleFormSubmit}>
          <div className="field">
            <label htmlFor="from-email">Your Email</label>
            <input
              type="email"
              value={emailFrom}
              onChange={({ target }) => setEmailFrom(target.value)}
              required
              autoFocus
              id="from-email"
            />
          </div>
          <div className="field">
            <label htmlFor="to-email">Receiver's Email</label>
            <input
              type="email"
              value={emailTo}
              onChange={({ target }) => setEmailTo(target.value)}
              required
              id="to-email"
            />
          </div>
          <button disabled={isSending} type="submit">
            Send
          </button>
        </form>
      </div>
      <div
        style={{
          transform: toastMessage ? "translate(-50%, 0px)" : "",
        }}
        className="toast"
      >
        {toastMessage}
      </div>
    </div>
  );
};

export default App;
