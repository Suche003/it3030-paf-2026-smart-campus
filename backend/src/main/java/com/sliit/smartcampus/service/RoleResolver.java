package com.sliit.smartcampus.service;

import com.sliit.smartcampus.enumtypes.Role;
import org.springframework.stereotype.Service;

@Service
public class RoleResolver {

    public Role getRoleByEmail(String email) {

        if (email.equals("admin@gmail.com")) {
            return Role.ADMIN;
        }

        if (email.endsWith("@technician.lk")) {
            return Role.TECHNICIAN;
        }

        if (email.endsWith("@lecturer.sliit.lk")) {
            return Role.LECTURER;
        }

        return Role.STUDENT;
    }
}