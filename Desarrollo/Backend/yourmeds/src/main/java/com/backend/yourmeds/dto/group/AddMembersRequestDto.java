package com.backend.yourmeds.dto.group;

import java.util.List;

public class AddMembersRequestDto {

    public List<String> userEmails;

    // Opcional: si quieres marcar a alguien como owner en el mismo request
    public String ownerEmail;
}

