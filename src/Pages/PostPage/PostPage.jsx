// Libraries && Context
import React, { useState, useContext } from 'react';
import { useQuery } from 'react-query';
import { Link, useParams } from 'react-router-dom';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertFromRaw } from 'draft-js';
import { UserContext } from '../../Context/UserContext';

// Api Services
import { fetchPost } from '../../ApiServices/TasksService';

// Components
import Navbar from '../../Components/Navbar/Navbar';
import LikeButton from '../../Components/LikeButton/LikeButton';

// Styling
import './PostPage.css';

export default function Post() {
  const { updateData, currentUser } = useContext(UserContext);
  const { id } = useParams();
  const [editorState, setEditorState] = useState();

  const { data: postData , isLoading, isError } = useQuery(
    'posts', 
    () => fetchPost(id),
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        const convertedState = convertFromRaw(data.post[0].content);
        setEditorState(() => EditorState.createWithContent(convertedState));
        updateData(data.post[0])
      }
    }
  );

  if (isLoading) {return <p>Loading...</p>};
  if (isError) {return <p>An Error occurred</p>};
  const data = postData.post;

  return (
    <main className='post-page'>
      <div className='App'>
        <Navbar />
        <h1>{data[0].post_title}</h1>
        <h3>
          <i>{data[0].post_description}</i>
        </h3>
        <p className='created-date'>
          Created: {new Date(Number(data[0].date_created)).toLocaleString()}
        </p>
        {data[0].date_edited && (
          <p className='edited-date'>
            Last Edited:{' '}
            {new Date(Number(data[0].date_edited)).toLocaleString()}
          </p>
        )}
        <p className='created-by'>By: {data[0].Author}</p>
        {data[0].user_id === currentUser.user.userId && (
          <Link to={`/HomePage/Posts/EditPost/${data[0].post_id}`}>edit</Link>
        )}
        <LikeButton id={data[0].post_id} />
        <div className='editor-container'>
          <Editor
            toolbarHidden={true}
            editorState={editorState}
            readOnly={true}
          />
        </div>
      </div>
    </main>
  );
};
