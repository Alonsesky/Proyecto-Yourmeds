package com.backend.yourmeds.service;

import com.backend.yourmeds.dto.alarm.AlarmResponseDto;
import com.backend.yourmeds.dto.alarm.CreateAlarmRequestDto;
import com.backend.yourmeds.dto.alarm.UpdateAlarmRequestDto;
import com.backend.yourmeds.entity.Alarm;
import com.backend.yourmeds.entity.Group;
import com.backend.yourmeds.repository.AlarmRepository;
import com.backend.yourmeds.repository.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class AlarmService {

    @Autowired
    AlarmRepository alarmRepository;
    @Autowired
    GroupRepository groupRepository;

    public AlarmResponseDto create(CreateAlarmRequestDto dto) {
        Group group = groupRepository.findById(dto.groupId)
                .orElseThrow(() -> new NoSuchElementException("Group not found with id " + dto.groupId));

        Alarm alarm = new Alarm();
        alarm.setName(dto.name);
        if (dto.alarmType != null) alarm.setAlarmType(dto.alarmType);
        if (dto.active != null)    alarm.setActive(dto.active);
        alarm.setCant(dto.cant);
        alarm.setDateStart(dto.dateStart);
        alarm.setDateEnd(dto.dateEnd);
        alarm.setDescription(dto.description);
        alarm.setGroup(group);

        alarm = alarmRepository.save(alarm);
        return toDto(alarm);
    }


    public AlarmResponseDto getById(Long id) {
        Alarm alarm = alarmRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Alarm not found with id " + id));
        return toDto(alarm);
    }


    public List<AlarmResponseDto> listAll() {
        return alarmRepository.findAll().stream().map(this::toDto).toList();
    }

    public List<AlarmResponseDto> listByGroup(Long groupId) {
        // valida existencia del grupo para mensajes más claros
        groupRepository.findById(groupId)
                .orElseThrow(() -> new NoSuchElementException("Group not found with id " + groupId));
        return alarmRepository.findByGroup_IdOrderByDateStartAsc(groupId)
                .stream().map(this::toDto).toList();
    }

    public AlarmResponseDto update(Long id, UpdateAlarmRequestDto dto) {
        Alarm alarm = alarmRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Alarm not found with id " + id));

        if (dto.name != null)       alarm.setName(dto.name);
        if (dto.alarmType != null)  alarm.setAlarmType(dto.alarmType);
        if (dto.active != null)     alarm.setActive(dto.active);
        if (dto.cant != null)       alarm.setCant(dto.cant);
        if (dto.dateStart != null)  alarm.setDateStart(dto.dateStart);
        if (dto.dateEnd != null)    alarm.setDateEnd(dto.dateEnd);
        if (dto.description != null)alarm.setDescription(dto.description);

        if (dto.groupId != null) {
            Group group = groupRepository.findById(dto.groupId)
                    .orElseThrow(() -> new NoSuchElementException("Group not found with id " + dto.groupId));
            alarm.setGroup(group);
        }

        alarm = alarmRepository.save(alarm);
        return toDto(alarm);
    }

    public void delete(Long id) {
        Alarm alarm = alarmRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Alarm not found with id " + id));
        alarmRepository.delete(alarm);
    }

    private AlarmResponseDto toDto(Alarm a) {
        AlarmResponseDto dto = new AlarmResponseDto();
        dto.setId(a.getId());
        dto.setName(a.getName());
        dto.setAlarmType(a.isAlarmType());
        dto.setActive(a.isActive());
        dto.setCant(a.getCant());
        dto.setDateStart(a.getDateStart());
        dto.setDateEnd(a.getDateEnd());
        dto.setDescription(a.getDescription());
        dto.setGroupId(a.getGroup() != null ? a.getGroup().getId() : null);
        return dto;
    }
}

