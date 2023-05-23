import React, {useRef} from "react"

/**
     * 
     * @param {Array} photosAll photos to pick from
     * @param {Object || Null} photo the photo that's currently picked 
     * @param {Function} pickCb fire when a photo gets picked
     * @param {Function} upload fire when uploading files
     * @description picks a single photo from photosAll
     */ 
function PhotoPicker({photosAll, photo, pickCb, upload}) {
    return (
        <div className="photos-container">
            <PhotosRadios
                photos={photosAll.map(_photo => 
                    ({
                        ..._photo, 
                        picked: photo ? photo.id === _photo.id : false
                    })
                )}
                pickCb={pickCb}
            />
            <PhotosUpload upload={upload} />
        </div>
    )
}

/**
 * @param {Array} photos photos to pick from
 * @param {Function} pickCb fire when a photo gets picked
 * @description use HTML input of type 'radio' to pick a single photo from a list
*/
function PhotosRadios({photos, pickCb}) {
    return (
        <div>{
            photos.map(photo => <PhotoRadio 
                key={photo.id}
                photo={photo}
                picked={photo.picked}
                pickCb={pickCb}
                name={"photos-radios"}
            />)
        }</div>
    )
}

/**
 * @param {Object} photo the photo to render
 * @param {Boolean} picked whether the 'radio' should be checked
 * @param {Function} pickCb fire when the 'radio' is checked (but not when it's unchecked)
 * @param {String} name HTML input 'name' attribute
 * @description uses HTML input type 'radio' to render a pickable photo. Only fires when element is picked (but not when it is unpicked)
*/
function PhotoRadio({photo, picked, pickCb, name}) {
    const _pickCb = (ev) => {
        if (!ev.target.checked) return
        
        pickCb(photo)
      }

      return (
        <div className="photo photo-pickable">
            <img src={photo.path} />
            
            {
            picked 
            ? 
            <input type="radio" name={name} onChange={_pickCb} defaultChecked></input>

            :
            <input type="radio" name={name} onChange={_pickCb}></input>
            }
        </div>
      )
}

/**
 * @param {Array} photosAll photos to pick from
 * @param {Array} photos the photos that are already picked
 * @param {Function} pickCb fire when a photo gets checked or unchecked
 * @param {Function} upload fire when files are chosen for upload
 * @description picks one or multiple photos from photosAll
*/
function PhotosPicker({photosAll, photos, pickCb, upload}) {
    return (
        <div className="photos-container">
            <PhotosPickable 
                photos={photosAll.map(photo => 
                    ({
                        ...photo, 
                        picked: photos.map(photo => photo.id).includes(photo.id)
                    })
                )} 
                pickCb={pickCb} 
            />
            <PhotosUpload upload={upload}/>
        </div>
    )
}

/**
 * @param {Array} photos photos to pick from
 * @param {Function} pickCb callback to pass to PhotoPicked
 * @description renders `photos` using PhotoPickable
*/
function PhotosPickable({photos, pickCb}) {
    return (
        <div className="photos">{
            photos.map(photo => <PhotoPickable 
                key={photo.id} 
                photo={photo} 
                pickCb={pickCb}
                picked={photo.picked}
            />)
        }</div>
    )
}

/**
 * @param {Object} photo photo to render
 * @param {Boolean} picked whether to render the photo checkmarked
 * @param {Function} pickCb callback for when photo gets checked or unchecked
*/
function PhotoPickable({photo, picked, pickCb}) {
    const _pickCb = (ev) => {
      pickCb(ev.target.checked, photo)
    }

    return (
      <div className="photo photo-pickable">
          <img src={photo.path} />
          
          {
          picked 
          ? 
          <input type="checkbox" onChange={_pickCb} defaultChecked></input>

          :
          <input type="checkbox" onChange={_pickCb}></input>
          }
      </div>
    )
}

function PhotosUpload({upload}) {
    const files = useRef()

    return (
        <div>
            <input id="photos-upload" ref={files} type='file' accept="image/*" multiple />
            <button onClick={() => {
                upload(files.current.files)
            }}>upload</button>
        </div>
    )
}

export {
    PhotoPicker,
    PhotosPicker,
    PhotosRadios,
    PhotoRadio,
    PhotosPickable,
    PhotoPickable,
    PhotosUpload,
}