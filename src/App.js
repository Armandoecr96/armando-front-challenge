import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [images, setImages] = useState([]);
  const BACKGROUND_SIZE = ["cover", "contain", "auto"];

  useEffect(() => {
    getImages()
    return () => console.log("Cleanup..");
  }, [])

  /**
   * Get images from api
   */
  const getImages = async () => {
    fetch("https://jsonplaceholder.typicode.com/photos").then(res => { return res.json() }).then((images) => {
      setImages(images)
    }).catch((error) => {
      console.log(error);
    }).finally(() => {
      setIsLoading(false)
    })
  }

  /**
 * Add new elemento to array of moveables
 */
  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        bottom: undefined,
        right: undefined,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * (COLORS.length - 1))],
        image: images[Math.floor(Math.random() * (images.length - 1))],
        backgoundSize: BACKGROUND_SIZE[Math.floor(Math.random() * (BACKGROUND_SIZE.length - 1))],
        updateEnd: true
      },
    ]);
  };

  /**
* Delete element of array of moveables
*/
  const onDeleteMoveable = (id) => {
    const filterMoveable = moveableComponents.filter((mc) => mc.id !== id);
    setMoveableComponents(filterMoveable)
  }

  /**
* Update element of array of moveables
* @param id - ID of moveable element
* @param newComponent Object of element to update
        {
        id: number,
        top: number,
        left: number,
        bottom: number,
        right: number,
        width: number,
        height: number,
        color: string,
        image: object,
        backgoundSize: string,
        updateEnd: boolean
        }
  @param updateEnd - Flag for check if the element updating
*/
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    let parent = document.getElementById("parent");
    let parentBounds = parent?.getBoundingClientRect();
    newComponent = {
      ...newComponent,
      top: newComponent.top > 0 ? newComponent.bottom > 0 ? newComponent.top : parentBounds.height - newComponent.height : 0,
      left: newComponent.left > 0 ? newComponent.right > 0 ? newComponent.left : parentBounds.width - newComponent.width : 0,
      bottom: newComponent.bottom > 0 ? newComponent.bottom : 0,
      right: newComponent.right > 0 ? newComponent.right : 0,
    }

    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      {
        isLoading ? <div>Cargando...</div> : <div
          id="parent"
          style={{
            position: "relative",
            background: "black",
            height: "80vh",
            width: "80vw",
          }}
        >
          {moveableComponents.map((item, index) => (
            <Component
              {...item}
              key={index}
              updateMoveable={updateMoveable}
              handleResizeStart={handleResizeStart}
              setSelected={setSelected}
              isSelected={selected === item.id}
              onHandleDelete={onDeleteMoveable}
            />
          ))}
        </div>
      }

    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  right,
  bottom,
  height,
  index,
  color,
  image,
  backgoundSize,
  id,
  setSelected,
  isSelected = false,
  onHandleDelete,
  updateEnd,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    right,
    bottom,
    width,
    height,
    index,
    color,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      right,
      bottom,
      width: newWidth,
      height: newHeight,
      color,
      image,
      backgoundSize,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
      image,
      backgoundSize,
    });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(
      id,
      {
        top,
        left,
        bottom,
        right,
        width: newWidth,
        height: newHeight,
        color,
        image,
        backgoundSize,
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          right: right,
          bottom: bottom,
          width: width,
          height: height,
          background: image?.url ? "transparent" : color,
          backgroundImage: `url("${image?.url}")`,
          backgoundSize: backgoundSize
        }}
        onClick={() => setSelected(id)}
      >
        <div className="btn-delete" style={{
          position: "absolute",
          cursor: "pointer"
        }}
          onClick={() => onHandleDelete(id)}>
          delete
        </div>
      </div>

      <Moveable
        target={isSelected && ref.current}
        container={parent}
        resizable={true}
        warpable={true}
        draggable={true}
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            right: e.right,
            bottom: e.bottom,
            width,
            height,
            color,
            image,
            backgoundSize,
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
