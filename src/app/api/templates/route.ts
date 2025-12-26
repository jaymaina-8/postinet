import { NextRequest, NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabaseAdmin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET: Fetch all templates (predefined + user's custom templates)
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all templates (predefined + user's custom)
    const { data: templates, error } = await supabaseAdmin
      .from('templates')
      .select('*')
      .order('is_custom', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST: Create a new custom template
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, prompt } = body;

    if (!title || !prompt) {
      return NextResponse.json(
        { error: 'Title and prompt are required' },
        { status: 400 }
      );
    }

    const { data: template, error } = await supabaseAdmin
      .from('templates')
      .insert({
        title,
        prompt,
        user_id: user.id,
        is_custom: true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    );
  }
}

// PUT: Update a custom template
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, prompt } = body;

    if (!id || !title || !prompt) {
      return NextResponse.json(
        { error: 'ID, title, and prompt are required' },
        { status: 400 }
      );
    }

    // Verify the template belongs to the user and is custom
    const { data: existingTemplate, error: fetchError } = await supabaseAdmin
      .from('templates')
      .select('id, user_id, is_custom')
      .eq('id', id)
      .single();

    if (fetchError || !existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (!existingTemplate.is_custom || existingTemplate.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Cannot update this template' },
        { status: 403 }
      );
    }

    const { data: template, error } = await supabaseAdmin
      .from('templates')
      .update({ title, prompt })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ template });
  } catch (error: any) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a custom template
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Verify the template belongs to the user and is custom
    const { data: existingTemplate, error: fetchError } = await supabaseAdmin
      .from('templates')
      .select('id, user_id, is_custom')
      .eq('id', id)
      .single();

    if (fetchError || !existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (!existingTemplate.is_custom || existingTemplate.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Cannot delete this template' },
        { status: 403 }
      );
    }

    const { error } = await supabaseAdmin
      .from('templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete template' },
      { status: 500 }
    );
  }
}

