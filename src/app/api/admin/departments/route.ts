import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if the user is an admin
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { role: true },
    });
    
    if (!currentUser || !currentUser.role || (currentUser.role.name !== 'CEO' && currentUser.role.name !== 'Admin')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    // Fetch all departments
    const departments = await prisma.department.findMany({
      where: {
        isActive: true,
      },
      include: {
        head: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parentDepartment: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            users: true,
            roles: true,
            projects: true,
          },
        },
      },
      orderBy: [
        {
          name: 'asc',
        },
      ],
    });
    
    // Convert Decimal fields to numbers for client compatibility
    const serializedDepartments = departments.map(dept => ({
      ...dept,
      budget: dept.budget ? Number(dept.budget) : null
    }))
    
    return NextResponse.json(serializedDepartments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching departments' },
      { status: 500 }
    );
  }
}

// Create new department
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if the user is an admin
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { role: true },
    });
    
    if (!currentUser || !currentUser.role || (currentUser.role.name !== 'CEO' && currentUser.role.name !== 'Admin')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    const body = await request.json();
    const { name, description, headId, parentDepartmentId, budget } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }
    
    // Check if department name already exists
    const existingDepartment = await prisma.department.findUnique({
      where: { name }
    });
    
    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Department with this name already exists' },
        { status: 400 }
      );
    }
    
    // Create the new department
    const newDepartment = await prisma.department.create({
      data: {
        name,
        description,
        headId: headId || null,
        parentDepartmentId: parentDepartmentId || null,
        budget: budget ? parseFloat(budget) : null,
      },
      include: {
        head: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parentDepartment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'DEPARTMENT_CREATED',
        entityType: 'DEPARTMENT',
        entityId: newDepartment.id,
        userId: currentUser.id,
        newValue: JSON.stringify(newDepartment),
      },
    });
    
    // Convert Decimal fields to numbers for client compatibility
    const serializedDepartment = {
      ...newDepartment,
      budget: newDepartment.budget ? Number(newDepartment.budget) : null
    }
    
    return NextResponse.json({
      success: true,
      department: serializedDepartment,
      message: 'Department created successfully'
    });
    
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the department' },
      { status: 500 }
    );
  }
}

// Update existing department
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if the user is an admin
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { role: true },
    });
    
    if (!currentUser || !currentUser.role || (currentUser.role.name !== 'CEO' && currentUser.role.name !== 'Admin')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    const body = await request.json();
    const { id, name, description, headId, parentDepartmentId, budget, isActive } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Department ID is required' },
        { status: 400 }
      );
    }
    
    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id }
    });
    
    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    // Check if new name conflicts with other departments
    if (name && name !== existingDepartment.name) {
      const nameConflict = await prisma.department.findUnique({
        where: { name }
      });
      
      if (nameConflict) {
        return NextResponse.json(
          { error: 'Department with this name already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update the department
    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        name: name || existingDepartment.name,
        description: description !== undefined ? description : existingDepartment.description,
        headId: headId !== undefined ? headId : existingDepartment.headId,
        parentDepartmentId: parentDepartmentId !== undefined ? parentDepartmentId : existingDepartment.parentDepartmentId,
        budget: budget !== undefined ? parseFloat(budget) : existingDepartment.budget,
        isActive: isActive !== undefined ? isActive : existingDepartment.isActive,
      },
      include: {
        head: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parentDepartment: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'DEPARTMENT_UPDATED',
        entityType: 'DEPARTMENT',
        entityId: id,
        userId: currentUser.id,
        oldValue: JSON.stringify(existingDepartment),
        newValue: JSON.stringify(updatedDepartment),
      },
    });
    
    // Convert Decimal fields to numbers for client compatibility
    const serializedDepartment = {
      ...updatedDepartment,
      budget: updatedDepartment.budget ? Number(updatedDepartment.budget) : null
    }
    
    return NextResponse.json({
      success: true,
      department: serializedDepartment,
      message: 'Department updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the department' },
      { status: 500 }
    );
  }
}

// Delete department
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if the user is an admin
    const currentUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: { role: true },
    });
    
    if (!currentUser || !currentUser.role || (currentUser.role.name !== 'CEO' && currentUser.role.name !== 'Admin')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('id');
    
    if (!departmentId) {
      return NextResponse.json(
        { error: 'Department ID is required' },
        { status: 400 }
      );
    }
    
    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        _count: {
          select: {
            users: true,
            roles: true,
            projects: true,
            subDepartments: true,
          },
        },
      },
    });
    
    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }
    
    // Check if department has users, roles, projects, or sub-departments
    if (existingDepartment._count.users > 0 || 
        existingDepartment._count.roles > 0 || 
        existingDepartment._count.projects > 0 ||
        existingDepartment._count.subDepartments > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete department with assigned users, roles, projects, or sub-departments. Please reassign or remove them first.',
          counts: existingDepartment._count
        },
        { status: 400 }
      );
    }
    
    // Delete the department
    await prisma.department.delete({
      where: { id: departmentId }
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        action: 'DEPARTMENT_DELETED',
        entityType: 'DEPARTMENT',
        entityId: departmentId,
        userId: currentUser.id,
        oldValue: JSON.stringify(existingDepartment),
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Department deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the department' },
      { status: 500 }
    );
  }
}
