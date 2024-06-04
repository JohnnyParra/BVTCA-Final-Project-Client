// Libraries
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { useMutation, useQueryClient } from 'react-query';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw } from 'draft-js';

// MUI Components && Icons
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';

// Api Services
import { addPostRequest } from '../../ApiServices/TasksService';

// Components
import SelectOption from '../../Components/SelectOption/SelectOption';
import Navbar from '../../Components/Navbar/Navbar';

// Utilities
import { categoryOptions } from '../../Utils/CategoryOptions';

// Styling
import './CreatePostPage.css';

export default function CreatePost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [input, setInput] = useState({
    title: '',
    description: '',
    image: '',
    category: 4,
  });
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [contentState, setContentState] = useState();
  const [previewImage, setPreviewImage] = useState('');

  const { mutate: mutateAddPosts } = useMutation(
    (newPost) => addPostRequest(newPost),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['posts']);
        navigate('/HomePage/Posts');
      },
    }
  );

  useEffect(() => {
    const content = editorState.getCurrentContent();
    setContentState(convertToRaw(content));
  }, [editorState]);

  function handleChange(event) {
    const { name, value } = event.target;
    setInput((prevInput) => ({ ...prevInput, [name]: value }));
  }

  function handleSelect(value) {
    setInput((prevInput) => ({ ...prevInput, category: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (event.target.name === 'cancel') {
      navigate(`/HomePage`);
      return;
    } else if (event.target.name === 'save') {
      let formData = new FormData();
      if (input.image != '') formData.append('image', input.image);
      formData.append('type', 'save');
      formData.append('title', JSON.stringify(input.title));
      formData.append(
        'description',
        JSON.stringify(input.description)
      );
      formData.append('content', JSON.stringify(contentState));
      formData.append('category', input.category);
      formData.append('id', nanoid());
      mutateAddPosts(formData);
    } else if (event.target.name === 'publish') {
      if (
        input.title === '' ||
        input.description === '' ||
        input.image === ''
      ) {
        return alert('Missing Inputs');
      }
      let formData = new FormData();
      formData.append('image', input.image);
      formData.append('type', 'publish');
      formData.append('title', JSON.stringify(input.title));
      formData.append(
        'description',
        JSON.stringify(input.description)
      );
      formData.append('content', JSON.stringify(contentState));
      formData.append('category', input.category);
      formData.append('id', nanoid());
      mutateAddPosts(formData);
    }
  }

  function fileSubmit(event) {
    let imageData = new FormData();
    imageData.append('image', event.target.files[0]);
    setInput((prevInput) => ({
      ...prevInput,
      [event.target.name]: event.target.files[0],
    }));
    setPreviewImage(URL.createObjectURL(event.target.files[0]));
  }

  return (
    <main className='create-post'>
      <div className='App'>
        <Navbar />
        <form>
          <div className='title-description-category-container'>
            <div className='title-description-container'>
              <label className="title-label" htmlFor='title'>Title</label>
              <input
                className='title'
                type='text'
                maxLength='50'
                name='title'
                id='title-label'
                value={input.title}
                onChange={(event) => handleChange(event)}
              />
              <label className="description-label" htmlFor='description'>Description</label>
              <input
                className='description'
                type='text'
                maxLength='100'
                name='description'
                id='description-label'
                value={input.description}
                onChange={(event) => handleChange(event)}
              />
            </div>
            <div className='category-container'>
              <SelectOption
                options={categoryOptions}
                selection='Category'
                handleSelect={handleSelect}
              />
            </div>
          </div>
          <div className='editor-container'>
            <Editor
              name='body'
              editorState={editorState}
              onEditorStateChange={setEditorState}
            />
          </div>
          <label className="image-label" htmlFor='image'>Choose an Image</label>
          <input
            type='file'
            name='image'
            className="image"
            accept='image/*'
            onChange={(event) => fileSubmit(event)}
          ></input>
          <div className='image-container'>
            {input.image !== '' && (
              <CardMedia
                component='img'
                sx={{ width: 160, height: '100%', display: { sm: 'block' } }}
                image={previewImage}
                alt='Preview of Image'
              />
            )}
          </div>
          <div className='btn-container'>
            <Button
              className='btn'
              onClick={(event) => submit(event)}
              name='cancel'
              size='small'
              variant='contained'
              color='warning'
              startIcon={<ClearIcon />}
            >
              Cancel
            </Button>
            {/* <button onClick={(event) => submit(event)} name="cancel">Cancel</button> */}
            <Button
              className='btn'
              onClick={(event) => submit(event)}
              name='save'
              size='small'
              variant='contained'
              color='warning'
              endIcon={<SaveIcon />}
            >
              Save to Drafts
            </Button>
            {/* <button onClick={(event) => submit(event)} name="save">Save</button> */}
            <Button
              className='btn'
              onClick={(event) => submit(event)}
              name='publish'
              size='small'
              variant='contained'
              color='warning'
              endIcon={<PublishIcon />}
            >
              Publish
            </Button>
            {/* <button onClick={(event) => submit(event)} name="publish">Publish</button> */}
          </div>
        </form>
      </div>
    </main>
  );
};
