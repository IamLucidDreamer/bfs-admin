import React, { useEffect, useReducer, useState } from "react";
import axios from "../appConfig/httpHelper";
import ActionButtons from "./components/actionsButtons/Index";
import { DataTable } from "./components/table/Index";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { EyeOutlined, CloseOutlined } from "@ant-design/icons";
import { innerTableActionBtnDesign } from "./components/styles/innerTableActions";
import { useFormik } from "formik";
import * as Yup from "yup";

const Videos = () => {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  // Declaring the States Required for the Working of the Component
  const [actions, setActions] = useReducer(
    (state, diff) => ({ ...state, ...diff }),
    {
      drawer: false,
      loading: false,
      pagination: 15,
      trash: false,
      loadingAllVideo: false,
      downloadAllVideo: false,
    }
  );

  const {
    drawer,
    loading,
    pagination,
    trash,
    loadingAllVideo,
    downloadAllVideo,
  } = actions;

  const [value, setValue] = useReducer(
    (state, diff) => ({ ...state, ...diff }),
    { video: [], allVideo: [] }
  );

  const { video, allVideo, drawerValue } = value;

  // Functions Used for Different Data
  const requestsCaller = () => {
    setActions({ loading: true });
    axios
      .get("/video/get-all")
      .then((res) => {
        setValue({
          video: res?.data?.data?.blogs,
        });
      })
      .catch((err) => console.log(err))
      .finally(setActions({ loading: false }));
  };

  const getAllVideo = () => {
    setActions({ loadingAllProducts: true });
    axios
      .get("/video/get-all", {})
      .then((res) => {
        toast.success("Business Users Ready for Download");
        setActions({ downloadAllVideo: true });
        setValue({
          allVideo: res?.data?.data?.blogs,
        });
      })
      .catch((err) => console.log(err))
      .finally(setActions({ loadingAllBusiness: true }));
  };

  const handleNewVideo = (value) => {
    console.log(value.video, "value");
    const formData = new FormData();
    formData.append("video", value.video);
    delete value.video;
    formData.append("data", JSON.stringify(value));
    console.log(formData, "hello");
    axios
      .post("/video/create", formData, {
        onUploadProgress: (progressEvent) => {
          // Calculate the upload progress percentage
          const uploadProgress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setProgress(uploadProgress);

          // Update the UI to display the progress
          console.log(`Upload Progress: ${uploadProgress}%`);
        },
      })
      .then((res) => {
        toast.success("New Video Added Successfully.");
        requestsCaller();
        setShow(false);
      })
      .catch((err) => console.log(err))
      .finally(setActions({ loadingAllBusiness: true }));
  };

  const deletePackaging = () => {};

  const showAddNew = () => setShow(true);

  useEffect(() => requestsCaller(), []);

  // Table Column
  const columns = [
    {
      key: "title",
      title: "Title",
      render: (data) => data.title,
    },
    {
      key: "description",
      title: "Description",
      render: (data) => data.description,
    },
    {
      key: "video",
      title: "Video",
      render: (data) => data.video,
    },
    // {
    //   key: "actions",
    //   title: "Actions",
    //   render: (record) => <ColumnActions record={record} />,
    // },
  ];

  const ColumnActions = (props) => {
    return (
      <div className="flex justify-around">
        <EyeOutlined
          title="View"
          style={innerTableActionBtnDesign}
          onClick={() => {
            setActions({ drawer: true });
            setValue({ drawerValue: props?.record });
          }}
        />
      </div>
    );
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Required"),
      description: Yup.string().required("Required"),
    }),
    onSubmit: (values) => {
      console.log("Hello world");
      handleNewVideo(values);
    },
  });

  return (
    <div className="">
      <ActionButtons
        pageTitle={"Video"}
        showTrashButton={false}
        showTrashFunction={""}
        showReFreshButton={true}
        refreshFunction={requestsCaller}
        showExportDataButton={true}
        exportDataFunction={getAllVideo}
        totalItems={allVideo}
        csvName={"video"}
        loadingItems={loadingAllVideo}
        downloadItems={downloadAllVideo}
        showAddNewButton={true}
        addNewFunction={showAddNew}
      />
      {show ? (
        <form
          onSubmit={formik.handleSubmit}
          className="my-6 max-w-screen-lg mx-auto"
        >
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl text-purple-1 m-0">Add New Video Type</h1>
            <button className="ml-10 mt-0 pt-0" onClick={() => setShow(false)}>
              <CloseOutlined style={{ fontSize: "20px" }} />
            </button>
          </div>
          <div className="flex flex-col gap-4 mt-4">
            <div className="">
              <input
                type="text"
                placeholder="Title of Video"
                className="border-2 border-purple-1 px-2 py-3 bg-purple-1 bg-opacity-5 rounded-lg w-full"
                {...formik.getFieldProps("title")}
              />
              {formik.touched.title && formik.errors.title ? (
                <div>{formik.errors.title}</div>
              ) : null}
            </div>
            <div className="">
              <textarea
                placeholder="Description of video"
                className="border-2 border-purple-1 px-2 py-3 bg-purple-1 bg-opacity-5 rounded-lg w-full h-40"
                {...formik.getFieldProps("description")}
              />
              {formik.touched.description && formik.errors.description ? (
                <div>{formik.errors.description}</div>
              ) : null}
            </div>
            <div className="flex items-center justify-evenly gap-4">
              <div className="">
                <h1>Video</h1>
                <input
                  type="file"
                  placeholder="Name of Packaging Type"
                  className="border-2 border-purple-1 px-2 py-3 bg-purple-1 bg-opacity-5 rounded-lg"
                  onChange={(e) =>
                    formik.setFieldValue("video", e.currentTarget.files[0])
                  }
                />
              </div>
            </div>
            <button
              className="ml-10 text-xl bg-secondary text-white p-3 rounded-xl"
              type="submit"
            >
              Submit
            </button>
          </div>

          {progress !== 0 && progress !== 100 && (
            <div className="w-full lg:w-1/2 rounded-full bg-gray-500 my-3 mx-auto">
              <div
                className="h-2 bg-primary rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          {progress === 100 && (
            <h1 className="my-2 text-center">Video Processing</h1>
          )}
        </form>
      ) : null}
      <div className="border-2 mt-5">
        <DataTable usersData={video} columns={columns} loading={loading} />
      </div>
    </div>
  );
};

export default Videos;
