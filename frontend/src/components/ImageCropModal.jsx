import Cropper from "react-easy-crop";


export default function ImageCropModal({
  image,
  open,
  onClose,
  crop,
  setCrop,
  zoom,
  setZoom
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.75)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: 700,
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden"
        }}
      >
        <div
          style={{
            position: "relative",
            height: 450
          }}
        >
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
          />
        </div>

        <div
          style={{
            padding: 20
          }}
        >
          <input
            type="range"
            min={1}
            max={5}
            step={0.1}
            value={zoom}
            onChange={(e) =>
              setZoom(Number(e.target.value))
            }
            style={{
              width: "100%"
            }}
          />

          <button
            onClick={onClose}
            style={{
              marginTop: 15
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}