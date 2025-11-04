package com.backend.yourmeds.service;

import com.backend.yourmeds.dto.alarm.AlarmResponseDto;
import com.backend.yourmeds.dto.alarm.CreateAlarmRequestDto;
import com.backend.yourmeds.dto.alarm.UpdateAlarmRequestDto;
import com.backend.yourmeds.entity.Alarm;
import com.backend.yourmeds.entity.Group;
import com.backend.yourmeds.repository.AlarmRepository;
import com.backend.yourmeds.repository.GroupHasUserRepository;
import com.backend.yourmeds.repository.GroupRepository;
import com.backend.yourmeds.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class AlarmService {

    @Autowired
    AlarmRepository alarmRepository;
    @Autowired
    GroupRepository groupRepository;
    @Autowired
    GroupHasUserRepository groupHasUserRepository;
    @Autowired
    UserRepository userRepository;

    private AlarmResponseDto toResponse(Alarm a) {
        return AlarmResponseDto.builder()
                .id(a.getId())
                .name(a.getName())
                .alarm_type(a.isAlarmType())
                .active(a.isActive())
                .cant(a.getCant())
                .time_alarm(a.getTimeAlarm())
                .date_start(a.getDateStart())
                .date_end(a.getDateEnd())
                .description(a.getDescription())
                .timestamp(a.getTimestamp())
                .group_id(a.getGroup().getId())
                .build();
    }

    private Long currentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Usuario no encontrado"))
                .getId();
    }

    private void ensureMember(Long groupId, Long userId) {
        if (!groupHasUserRepository.existsById_GroupIdAndId_UserId(groupId, userId)) {
            throw new IllegalStateException("El usuario no pertenece al grupo " + groupId);
        }
    }

    @Transactional
    public AlarmResponseDto create(CreateAlarmRequestDto req) {
        Long userId = currentUserId();

        Group group = groupRepository.findById(req.group_id)
                .orElseThrow(() -> new NoSuchElementException("Grupo no encontrado"));

        boolean isOwner = groupHasUserRepository.existsByGroupIdAndUserIdAndIsOwnerTrue(group.getId(), userId);
        if (!isOwner) throw new AccessDeniedException("Solo el propietario del grupo puede crear alarmas.");

        if (req.name == null || req.name.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es obligatorio.");
        }
        if (req.time_alarm == null) {
            throw new IllegalArgumentException("La hora (time_alarm) es obligatoria.");
        }

        LocalDate start;
        LocalDate end;

        if (Boolean.FALSE.equals(req.alarm_type)) {
            // FIJO: si no vienen fechas, usar [hoy, hoy + 10 años]
            start = (req.date_start != null) ? req.date_start : LocalDate.now();
            end   = (req.date_end   != null) ? req.date_end   : start.plusYears(10);
        } else {
            // VARIADO: deben venir ambas
            if (req.date_start == null || req.date_end == null) {
                throw new IllegalArgumentException("Para alarmas 'variado' debes enviar date_start y date_end.");
            }
            start = req.date_start;
            end   = req.date_end;
        }

        if (end.isBefore(start)) {
            throw new IllegalArgumentException("date_end no puede ser anterior a date_start.");
        }

        Alarm a = new Alarm();
        a.setName(req.name.trim());
        a.setAlarmType(req.alarm_type);
        a.setActive(Boolean.TRUE.equals(req.active));
        a.setCant(req.cant != null ? req.cant : 1);
        a.setIntervalHours(req.interval_hours);
        a.setTimeAlarm(req.time_alarm);
        a.setDateStart(start);
        a.setDateEnd(end);
        a.setDescription(req.description);
        a.setGroup(group);
        a.setTimestamp(ZonedDateTime.now(ZoneId.systemDefault()));

        Alarm saved = alarmRepository.save(a);
        return toResponse(saved);
    }

    public AlarmResponseDto get(Long id) {
        Alarm a = alarmRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Alarma no encontrada"));
        // opcional: validar pertenencia al grupo de la alarma
        ensureMember(a.getGroup().getId(), currentUserId());
        return toResponse(a);
    }

    @Transactional
    public AlarmResponseDto update(Long id, UpdateAlarmRequestDto req) {
        Alarm a = alarmRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Alarma no encontrada"));
        ensureMember(a.getGroup().getId(), currentUserId());

        if (req.name != null) a.setName(req.name);
        if (req.alarm_type != null) a.setAlarmType(req.alarm_type);
        if (req.active != null) a.setActive(req.active);
        if (req.cant != null) a.setCant(req.cant);
        if (req.interval_hours != null)a.setIntervalHours(req.interval_hours);
        if (req.time_alarm != null) a.setTimeAlarm(req.time_alarm);
        if (req.date_start != null) a.setDateStart(req.date_start);
        if (req.date_end != null) a.setDateEnd(req.date_end);
        if (req.description != null) a.setDescription(req.description);

        Alarm saved = alarmRepository.save(a);
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        Alarm a = alarmRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Alarma no encontrada"));
        ensureMember(a.getGroup().getId(), currentUserId());
        alarmRepository.delete(a);
    }

    public List<AlarmResponseDto> listByGroup(Long groupId) {
        ensureMember(groupId, currentUserId());
        return alarmRepository.findByGroup_Id(groupId)
                .stream().map(this::toResponse).toList();
    }
}
