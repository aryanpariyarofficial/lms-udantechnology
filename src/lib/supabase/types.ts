/**
 * Database types for the UDAN Technology LMS.
 *
 * Hand-authored to mirror the SQL migrations in `supabase/migrations`.
 * Once a Supabase project is linked you can regenerate with:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole =
  | "super_admin"
  | "admin"
  | "instructor"
  | "student"
  | "membership_user"
export type VideoKind = "tutorial" | "stream"
export type CourseLevel = "beginner" | "intermediate" | "advanced" | "all_levels"
export type CourseStatus = "draft" | "published" | "archived"
export type LessonType = "video" | "pdf" | "assignment" | "quiz" | "file" | "text"
export type EnrollmentSource = "purchase" | "membership" | "manual" | "free"
export type PaymentMethod = "esewa" | "khalti" | "bank_transfer"
export type PaymentStatus = "pending" | "approved" | "rejected"
export type PurchaseKind = "course" | "membership"
export type MembershipStatus = "active" | "expired" | "cancelled"
export type QuizQuestionType = "mcq" | "multiple" | "true_false"
export type AssignmentStatus = "submitted" | "graded" | "returned"
export type ReviewStatus = "pending" | "approved" | "hidden"
export type ContentStatus = "draft" | "published" | "archived"
export type CouponType = "percentage" | "fixed"

type Timestamps = { created_at: string }

type Table<Row, Insert> = {
  Row: Row
  Insert: Insert
  Update: Partial<Insert>
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          headline: string | null
          bio: string | null
          phone: string | null
          is_suspended: boolean
          created_at: string
          updated_at: string
        },
        {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          headline?: string | null
          bio?: string | null
          phone?: string | null
          is_suspended?: boolean
        }
      >
      course_categories: Table<
        {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          sort_order: number
          created_at: string
        },
        {
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          sort_order?: number
        }
      >
      courses: Table<
        {
          id: string
          title: string
          slug: string
          subtitle: string | null
          description: string | null
          category_id: string | null
          instructor_id: string | null
          thumbnail_url: string | null
          trailer_url: string | null
          level: CourseLevel
          language: string
          price: number
          discount_price: number | null
          currency: string
          what_you_learn: string[]
          requirements: string[]
          duration_minutes: number
          status: CourseStatus
          is_featured: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        },
        {
          title: string
          slug: string
          subtitle?: string | null
          description?: string | null
          category_id?: string | null
          instructor_id?: string | null
          thumbnail_url?: string | null
          trailer_url?: string | null
          level?: CourseLevel
          language?: string
          price?: number
          discount_price?: number | null
          currency?: string
          what_you_learn?: string[]
          requirements?: string[]
          duration_minutes?: number
          status?: CourseStatus
          is_featured?: boolean
          published_at?: string | null
        }
      >
      course_faqs: Table<
        { id: string; course_id: string; question: string; answer: string; sort_order: number },
        { course_id: string; question: string; answer: string; sort_order?: number }
      >
      modules: Table<
        { id: string; course_id: string; title: string; sort_order: number; created_at: string },
        { course_id: string; title: string; sort_order?: number }
      >
      lessons: Table<
        {
          id: string
          module_id: string
          course_id: string
          title: string
          type: LessonType
          content: string | null
          video_provider: string | null
          video_url: string | null
          duration_seconds: number
          attachment_url: string | null
          is_preview: boolean
          drip_days: number
          sort_order: number
          created_at: string
        },
        {
          module_id: string
          course_id: string
          title: string
          type?: LessonType
          content?: string | null
          video_provider?: string | null
          video_url?: string | null
          duration_seconds?: number
          attachment_url?: string | null
          is_preview?: boolean
          drip_days?: number
          sort_order?: number
        }
      >
      enrollments: Table<
        {
          id: string
          user_id: string
          course_id: string
          source: EnrollmentSource
          expires_at: string | null
          created_at: string
        },
        {
          user_id: string
          course_id: string
          source?: EnrollmentSource
          expires_at?: string | null
        }
      >
      lesson_progress: Table<
        {
          id: string
          user_id: string
          lesson_id: string
          course_id: string
          completed: boolean
          completed_at: string | null
          last_position_seconds: number
          updated_at: string
        },
        {
          user_id: string
          lesson_id: string
          course_id: string
          completed?: boolean
          completed_at?: string | null
          last_position_seconds?: number
        }
      >
      certificates: Table<
        {
          id: string
          user_id: string
          course_id: string
          certificate_code: string
          issued_at: string
        },
        { user_id: string; course_id: string; certificate_code: string }
      >
      quizzes: Table<
        {
          id: string
          lesson_id: string
          course_id: string
          title: string
          pass_percentage: number
          time_limit_minutes: number | null
          max_attempts: number
          created_at: string
        },
        {
          lesson_id: string
          course_id: string
          title: string
          pass_percentage?: number
          time_limit_minutes?: number | null
          max_attempts?: number
        }
      >
      quiz_questions: Table<
        {
          id: string
          quiz_id: string
          question: string
          type: QuizQuestionType
          options: Json
          correct_answers: Json
          points: number
          sort_order: number
        },
        {
          quiz_id: string
          question: string
          type?: QuizQuestionType
          options?: Json
          correct_answers?: Json
          points?: number
          sort_order?: number
        }
      >
      quiz_attempts: Table<
        {
          id: string
          quiz_id: string
          user_id: string
          score: number
          passed: boolean
          answers: Json
          created_at: string
        },
        { quiz_id: string; user_id: string; score?: number; passed?: boolean; answers?: Json }
      >
      assignments: Table<
        {
          id: string
          lesson_id: string
          course_id: string
          title: string
          instructions: string | null
          max_points: number
          created_at: string
        },
        { lesson_id: string; course_id: string; title: string; instructions?: string | null; max_points?: number }
      >
      assignment_submissions: Table<
        {
          id: string
          assignment_id: string
          user_id: string
          content: string | null
          file_url: string | null
          link_url: string | null
          status: AssignmentStatus
          grade: number | null
          feedback: string | null
          graded_by: string | null
          graded_at: string | null
          created_at: string
        },
        {
          assignment_id: string
          user_id: string
          content?: string | null
          file_url?: string | null
          link_url?: string | null
          status?: AssignmentStatus
        }
      >
      membership_plans: Table<
        {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          currency: string
          duration_days: number
          features: string[]
          is_active: boolean
          sort_order: number
          created_at: string
        },
        {
          name: string
          slug: string
          description?: string | null
          price?: number
          currency?: string
          duration_days: number
          features?: string[]
          is_active?: boolean
          sort_order?: number
        }
      >
      membership_plan_courses: Table<
        { plan_id: string; course_id: string },
        { plan_id: string; course_id: string }
      >
      memberships: Table<
        {
          id: string
          user_id: string
          plan_id: string
          status: MembershipStatus
          starts_at: string
          expires_at: string
          created_at: string
        },
        {
          user_id: string
          plan_id: string
          status?: MembershipStatus
          starts_at?: string
          expires_at: string
        }
      >
      payments: Table<
        {
          id: string
          user_id: string
          kind: PurchaseKind
          course_id: string | null
          membership_plan_id: string | null
          method: PaymentMethod
          amount: number
          currency: string
          transaction_id: string | null
          screenshot_url: string | null
          remarks: string | null
          status: PaymentStatus
          review_note: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          coupon_id: string | null
          created_at: string
        },
        {
          user_id: string
          kind?: PurchaseKind
          course_id?: string | null
          membership_plan_id?: string | null
          method: PaymentMethod
          amount: number
          currency?: string
          transaction_id?: string | null
          screenshot_url?: string | null
          remarks?: string | null
          status?: PaymentStatus
          review_note?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          coupon_id?: string | null
        }
      >
      wishlists: Table<
        { user_id: string; course_id: string; created_at: string },
        { user_id: string; course_id: string }
      >
      reviews: Table<
        {
          id: string
          course_id: string
          user_id: string
          rating: number
          comment: string | null
          status: ReviewStatus
          created_at: string
        },
        { course_id: string; user_id: string; rating: number; comment?: string | null; status?: ReviewStatus }
      >
      notifications: Table<
        {
          id: string
          user_id: string
          title: string
          body: string | null
          type: string
          link: string | null
          is_read: boolean
          created_at: string
        },
        { user_id: string; title: string; body?: string | null; type?: string; link?: string | null; is_read?: boolean }
      >
      blog_categories: Table<
        { id: string; name: string; slug: string; created_at: string },
        { name: string; slug: string }
      >
      blogs: Table<
        {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string | null
          cover_url: string | null
          author_id: string | null
          category_id: string | null
          tags: string[]
          status: ContentStatus
          published_at: string | null
          created_at: string
          updated_at: string
        },
        {
          title: string
          slug: string
          excerpt?: string | null
          content?: string | null
          cover_url?: string | null
          author_id?: string | null
          category_id?: string | null
          tags?: string[]
          status?: ContentStatus
          published_at?: string | null
        }
      >
      settings: Table<
        { key: string; value: Json; updated_at: string },
        { key: string; value: Json }
      >
      contact_messages: Table<
        {
          id: string
          name: string
          email: string
          subject: string | null
          message: string
          is_read: boolean
          created_at: string
        },
        { name: string; email: string; subject?: string | null; message: string; is_read?: boolean }
      >
      coupons: Table<
        {
          id: string
          code: string
          type: CouponType
          value: number
          applies_to: string
          course_id: string | null
          max_uses: number
          used_count: number
          expires_at: string | null
          is_active: boolean
          created_at: string
        },
        {
          code: string
          type?: CouponType
          value?: number
          applies_to?: string
          course_id?: string | null
          max_uses?: number
          used_count?: number
          expires_at?: string | null
          is_active?: boolean
        }
      >
      videos: Table<
        {
          id: string
          kind: VideoKind
          title: string
          slug: string
          description: string | null
          youtube_url: string
          thumbnail_url: string | null
          category: string | null
          tags: string[]
          duration_minutes: number
          author_id: string | null
          status: ContentStatus
          published_at: string | null
          created_at: string
          updated_at: string
        },
        {
          kind: VideoKind
          title: string
          slug: string
          description?: string | null
          youtube_url: string
          thumbnail_url?: string | null
          category?: string | null
          tags?: string[]
          duration_minutes?: number
          author_id?: string | null
          status?: ContentStatus
          published_at?: string | null
        }
      >
      video_comments: Table<
        {
          id: string
          video_id: string
          user_id: string
          body: string
          created_at: string
        },
        { video_id: string; user_id: string; body: string }
      >
    }
    Views: {
      course_outline: {
        Row: {
          id: string
          course_id: string
          module_id: string
          module_title: string
          module_order: number
          title: string
          type: LessonType
          duration_seconds: number
          is_preview: boolean
          sort_order: number
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: { Args: { uid?: string }; Returns: boolean }
      is_staff: { Args: { uid?: string }; Returns: boolean }
      has_course_access: { Args: { uid: string; cid: string }; Returns: boolean }
      course_progress: { Args: { uid: string; cid: string }; Returns: number }
      get_quiz_questions: {
        Args: { p_quiz_id: string }
        Returns: {
          id: string
          question: string
          type: QuizQuestionType
          options: Json
          points: number
          sort_order: number
        }[]
      }
      submit_quiz_attempt: {
        Args: { p_quiz_id: string; p_answers: Json }
        Returns: Database["public"]["Tables"]["quiz_attempts"]["Row"]
      }
    }
    Enums: {
      user_role: UserRole
      course_level: CourseLevel
      course_status: CourseStatus
      lesson_type: LessonType
      enrollment_source: EnrollmentSource
      payment_method: PaymentMethod
      payment_status: PaymentStatus
      purchase_kind: PurchaseKind
      membership_status: MembershipStatus
      quiz_question_type: QuizQuestionType
      assignment_status: AssignmentStatus
      review_status: ReviewStatus
      content_status: ContentStatus
      coupon_type: CouponType
      video_kind: VideoKind
    }
  }
}

/* Convenience row aliases */
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Course = Database["public"]["Tables"]["courses"]["Row"]
export type CourseCategory = Database["public"]["Tables"]["course_categories"]["Row"]
export type Module = Database["public"]["Tables"]["modules"]["Row"]
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"]
export type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"]
export type LessonProgress = Database["public"]["Tables"]["lesson_progress"]["Row"]
export type Certificate = Database["public"]["Tables"]["certificates"]["Row"]
export type Quiz = Database["public"]["Tables"]["quizzes"]["Row"]
export type QuizQuestion = Database["public"]["Tables"]["quiz_questions"]["Row"]
export type Assignment = Database["public"]["Tables"]["assignments"]["Row"]
export type MembershipPlan = Database["public"]["Tables"]["membership_plans"]["Row"]
export type Membership = Database["public"]["Tables"]["memberships"]["Row"]
export type Payment = Database["public"]["Tables"]["payments"]["Row"]
export type Review = Database["public"]["Tables"]["reviews"]["Row"]
export type Notification = Database["public"]["Tables"]["notifications"]["Row"]
export type Blog = Database["public"]["Tables"]["blogs"]["Row"]
export type Video = Database["public"]["Tables"]["videos"]["Row"]
export type CourseOutlineRow = Database["public"]["Views"]["course_outline"]["Row"]
