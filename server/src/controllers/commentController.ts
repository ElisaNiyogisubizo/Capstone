import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Artwork from '../models/Artwork';

// Get comments for artwork
export const getArtworkComments = async (req: Request, res: Response) => {
  try {
    const { artworkId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [comments, total] = await Promise.all([
      Comment.find({ 
        artwork: artworkId, 
        isDeleted: false,
        parentComment: null // Only top-level comments
      })
        .populate('author', 'name avatar')
        .populate('likes', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Comment.countDocuments({ 
        artwork: artworkId, 
        isDeleted: false,
        parentComment: null
      }),
    ]);

    const pages = Math.ceil(total / Number(limit));

    return res.status(200).json({
      success: true,
      data: comments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages,
        hasNext: Number(page) < pages,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message,
    });
  }
};

// Create comment
export const createComment = async (req: Request, res: Response) => {
  try {
    const { artworkId } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = (req as any).user.id;

    // Validate artwork exists
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found',
      });
    }

    // Validate parent comment if provided
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment || parentComment.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found',
        });
      }
    }

    const comment = new Comment({
      artwork: artworkId,
      author: userId,
      content,
      parentComment: parentCommentId,
    });

    await comment.save();

    // Add comment to artwork
    await Artwork.findByIdAndUpdate(artworkId, {
      $push: { comments: comment._id }
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name avatar')
      .populate('parentComment', 'content author');

    return res.status(201).json({
      success: true,
      data: populatedComment,
      message: 'Comment created successfully',
    });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create comment',
      error: error.message,
    });
  }
};

// Update comment
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = (req as any).user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if user is the author or admin
    if (comment.author.toString() !== userId && (req as any).user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this comment',
      });
    }

    if (comment.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit deleted comment',
      });
    }

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();

    const updatedComment = await Comment.findById(id)
      .populate('author', 'name avatar')
      .populate('parentComment', 'content author');

    return res.status(200).json({
      success: true,
      data: updatedComment,
      message: 'Comment updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update comment',
      error: error.message,
    });
  }
};

// Delete comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check if user is the author or admin
    if (comment.author.toString() !== userId && (req as any).user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    comment.deletedBy = userId;
    await comment.save();

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message,
    });
  }
};

// Like/unlike comment
export const toggleCommentLike = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    if (comment.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot like deleted comment',
      });
    }

    const likeIndex = comment.likes.indexOf(userId);
    let liked = false;

    if (likeIndex > -1) {
      // Unlike
      comment.likes.splice(likeIndex, 1);
    } else {
      // Like
      comment.likes.push(userId);
      liked = true;
    }

    await comment.save();

    return res.status(200).json({
      success: true,
      data: {
        liked,
        likeCount: comment.likes.length,
      },
      message: liked ? 'Comment liked' : 'Comment unliked',
    });
  } catch (error: any) {
    console.error('Error toggling comment like:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle comment like',
      error: error.message,
    });
  }
};

// Get replies to a comment
export const getCommentReplies = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [replies, total] = await Promise.all([
      Comment.find({ 
        parentComment: id, 
        isDeleted: false 
      })
        .populate('author', 'name avatar')
        .populate('likes', 'name')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Comment.countDocuments({ 
        parentComment: id, 
        isDeleted: false 
      }),
    ]);

    const pages = Math.ceil(total / Number(limit));

    return res.status(200).json({
      success: true,
      data: replies,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages,
        hasNext: Number(page) < pages,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching comment replies:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch comment replies',
      error: error.message,
    });
  }
}; 