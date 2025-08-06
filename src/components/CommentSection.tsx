import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, Reply, Edit, Trash2 } from 'lucide-react';
import { commentService } from '../services/comment';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface CommentSectionProps {
  artworkId: string;
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  isEdited: boolean;
  editedAt?: string;
  likes: string[];
  likeCount: number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ artworkId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [artworkId]);

  const fetchComments = async () => {
    try {
      const response = await commentService.getArtworkComments(artworkId);
      setComments(response.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      await commentService.createComment(artworkId, { content: newComment });
      setNewComment('');
      await fetchComments();
      toast.success('Comment added successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      setLoading(true);
      await commentService.updateComment(commentId, { content: editContent });
      setEditingComment(null);
      setEditContent('');
      await fetchComments();
      toast.success('Comment updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      setLoading(true);
      await commentService.deleteComment(commentId);
      await fetchComments();
      toast.success('Comment deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await commentService.toggleCommentLike(commentId);
      await fetchComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to like comment');
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  if (!user) {
    return (
      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
        <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Please login to view and add comments</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <MessageCircle className="w-5 h-5 mr-2" />
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex space-x-3">
          <img
            src={user.avatar || '/images/artwork-portrait-1.jpeg'}
            alt={user.name}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              disabled={loading}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={loading || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment._id} className="border-b pb-4">
            <div className="flex space-x-3">
              <img
                src={comment.author.avatar || '/images/artwork-portrait-1.jpeg'}
                alt={comment.author.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium">{comment.author.name}</span>
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                  {comment.isEdited && (
                    <span className="text-xs text-gray-400">(edited)</span>
                  )}
                </div>

                {editingComment === comment._id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded resize-none"
                      rows={2}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditComment(comment._id)}
                        disabled={loading}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-800 mb-2">{comment.content}</p>
                )}

                <div className="flex items-center space-x-4 text-sm">
                  <button
                    onClick={() => handleLikeComment(comment._id)}
                    className={`flex items-center space-x-1 hover:text-red-500 ${
                      comment.likes.includes(user._id) ? 'text-red-500' : 'text-gray-500'
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                    <span>{comment.likeCount}</span>
                  </button>

                  {(comment.author._id === user._id || user.role === 'admin') && (
                    <>
                      <button
                        onClick={() => startEditing(comment)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
}; 