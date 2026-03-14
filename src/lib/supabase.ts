// ─── Types matching our DB schema ────────────────────────────────────────────

export interface ProjectMedia {
  id: string;
  project_id: string;
  media_url: string;
  media_type: string;
  order_index: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  slug: string;
  folder_name: string;
  cover_image: string;
  show_in_work_page: boolean;
  show_in_selected_work: boolean;
  display_order: number;
  created_at: string;
  project_media?: ProjectMedia[];
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_path: string;
  image_order: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
}

export interface Journal {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  password_hash: string;
}

// ─── Public data fetchers ─────────────────────────────────────────────────────

/** Fetch projects shown on the homepage Selected Work section */
export async function fetchSelectedWorkProjects(): Promise<Project[]> {
  try {
    const res = await fetch('/api/public/projects?type=selected');
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('fetchSelectedWorkProjects error:', error);
    return [];
  }
}

/** Fetch projects shown on the Work page */
export async function fetchWorkPageProjects(): Promise<Project[]> {
  try {
    const res = await fetch('/api/public/projects?type=work');
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('fetchWorkPageProjects error:', error);
    return [];
  }
}

/** Fetch a single project by its slug */
export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const res = await fetch(`/api/public/projects/${slug}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch (error) {
    console.error('fetchProjectBySlug error:', error);
    return null;
  }
}

/** Fetch all FAQs ordered by display_order */
export async function fetchFAQs(): Promise<FAQ[]> {
  try {
    const res = await fetch('/api/public/faq');
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('fetchFAQs error:', error);
    return [];
  }
}
