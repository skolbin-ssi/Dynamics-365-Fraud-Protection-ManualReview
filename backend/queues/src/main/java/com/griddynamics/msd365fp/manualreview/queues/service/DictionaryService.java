package com.griddynamics.msd365fp.manualreview.queues.service;

import com.griddynamics.msd365fp.manualreview.queues.model.DictionaryType;
import com.griddynamics.msd365fp.manualreview.queues.model.dto.DictionaryValueDTO;
import com.griddynamics.msd365fp.manualreview.queues.model.persistence.DictionaryEntity;
import com.griddynamics.msd365fp.manualreview.queues.repository.DictionaryRepository;
import com.griddynamics.msd365fp.manualreview.queues.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DictionaryService {

    private final DictionaryRepository dictRepository;
    private final ItemRepository itemRepository;
    @Value("${mr.dictionary.ttl}")
    private Duration dictionaryTtl;

    public List<String> searchRelevantEntities(final DictionaryType type,
                                               final String searchValue) {
        List<DictionaryEntity> dicts = dictRepository.findAllByType(type);
        return dicts.stream()
                .map(DictionaryEntity::getValue)
                .filter(dict -> dict.contains(searchValue))
                .sorted((dict1, dict2) -> {
                    if (dict1.startsWith(searchValue) && dict2.startsWith(searchValue)) {
                        return dict1.compareTo(dict2);
                    } else if (dict1.startsWith(searchValue)) {
                        return -1;
                    } else if (dict2.startsWith(searchValue)) {
                        return 1;
                    } else {
                        return dict1.compareTo(dict2);
                    }
                })
                .collect(Collectors.toList());
    }

    public void createDictionaryEntity(final DictionaryType type, final DictionaryValueDTO valueDto) {
        DictionaryEntity dictionaryEntity = new DictionaryEntity();
        dictionaryEntity.setType(type);
        dictionaryEntity.setValue(valueDto.getValue());
        dictionaryEntity.setId(String.format("%s:%s", type, valueDto.getValue()));
        dictionaryEntity.setTtl(type.getField() != null ? dictionaryTtl.toSeconds() : -1);
        dictRepository.save(dictionaryEntity);
        log.info("Dictionary entity was created: [{}]", dictionaryEntity);
    }

    public boolean updateDictionariesByStorageData() {
        log.info("Trying to update dictionaries by storage data.");
        Arrays.stream(DictionaryType.values())
                .filter(obj -> Objects.nonNull(obj.getField()))
                .forEach(type -> {
                    itemRepository.findAllByFilterField(type.getField())
                            .forEach(entry -> updateDictionary(type, entry));
                });
        return true;
    }

    private void updateDictionary(DictionaryType type, String entry) {
        String entryId = String.format("%s:%s", type, entry);
        Optional<DictionaryEntity> persisted = dictRepository.findById(entryId);
        DictionaryEntity toSave = persisted.orElseGet(() -> {
            DictionaryEntity newDict = new DictionaryEntity();
            newDict.setId(entryId);
            newDict.setType(type);
            return newDict;
        });
        if (toSave.getConfirmed() == null) {
            toSave.setValue(entry);
            toSave.setConfirmed(OffsetDateTime.now());
            toSave.setTtl(-1);
            dictRepository.save(toSave);
            log.info("Updated dictionary entry for ID [{}]: [{}]", entryId, toSave);
        }
    }

}
